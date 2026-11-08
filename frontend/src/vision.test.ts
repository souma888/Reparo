import { describe, it, expect, vi, afterEach } from "vitest";
import { identify } from "../../server/vision";
import endpoint from "../../api/vision";
import { visionRequestSchema, visionResultSchema } from "../../shared/vision";
import { guidesFor, repairGuides } from "../../shared/repair-guides";
const input = {
  photo: "data:image/jpeg;base64,AAAA",
  issue: "Washer does not start",
  consent: true,
};
const recognized = {
  category: "washer" as const,
  deviceName: "Washing machine",
  brand: "",
  modelNumber: "",
  recognition: "tentative" as const,
  uncertainty: "Label not visible",
  observations: ["Front loading door"],
  visibleIssues: [],
  hazardDetected: false,
  hazardReason: "",
};
afterEach(() => vi.unstubAllEnvs());
describe("visual identification", () => {
  it("requires explicit image consent and rejects remote URLs", () => {
    expect(
      visionRequestSchema.safeParse({ ...input, consent: false }).success,
    ).toBe(false);
    expect(
      visionRequestSchema.safeParse({
        ...input,
        photo: "https://example.com/private",
      }).success,
    ).toBe(false);
  });
  it("blocks reported hazards before making a model call", async () => {
    const model = vi.fn();
    const result = await identify(
      { ...input, issue: "Smoke from this washer" },
      model,
    );
    expect(result.hazardDetected).toBe(true);
    expect(model).not.toHaveBeenCalled();
  });
  it("returns real structured identification rather than a guessed fallback", async () => {
    expect(await identify(input, async () => recognized)).toEqual(recognized);
  });
  it("retains a visually detected hazard", async () => {
    expect(
      (
        await identify(input, async () => ({
          ...recognized,
          hazardDetected: true,
          hazardReason: "Exposed wire",
        }))
      ).hazardDetected,
    ).toBe(true);
  });
  it("does not overstate recognition for unsupported devices", async () => {
    const result = await identify(input, async () => ({
      ...recognized,
      category: "unsupported" as const,
      recognition: "clear" as const,
    }));
    expect(result.recognition).toBe("unknown");
  });
  it("rejects malformed results without inventing an appliance", async () => {
    await expect(
      identify(input, async () => ({}) as typeof recognized),
    ).rejects.toThrow();
  });
  it("reports missing credentials honestly", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
    await expect(identify(input)).rejects.toThrow("VISION_NOT_CONFIGURED");
  });
  it("validates classifications and output length", () => {
    expect(
      visionResultSchema.safeParse({ ...recognized, category: "imaginary" })
        .success,
    ).toBe(false);
    expect(
      visionResultSchema.safeParse({
        ...recognized,
        modelNumber: "x".repeat(101),
      }).success,
    ).toBe(false);
  });
  it("has a bounded, same-origin POST endpoint", async () => {
    expect(
      (await endpoint.fetch(new Request("http://localhost/api/vision"))).status,
    ).toBe(405);
    expect(
      (
        await endpoint.fetch(
          new Request("http://localhost/api/vision", {
            method: "POST",
            headers: {
              origin: "https://other.test",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
          }),
        )
      ).status,
    ).toBe(403);
  });
  it("returns a real service-unavailable response when no key exists", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
    const response = await endpoint.fetch(
      new Request("http://localhost/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toHaveProperty("error");
  });
});
describe("supported repair scope", () => {
  it("never offers repair procedures after a hazard stop", () => {
    expect(guidesFor("washer", true)).toEqual([]);
  });
  it("only offers guides for matching appliance categories", () => {
    expect(
      guidesFor("fridge", false).every((g) => g.appliance === "fridge"),
    ).toBe(true);
    expect(guidesFor("microwave", false)).toEqual([]);
  });
  it("requires an observed condition and source for every fixed guide", () => {
    for (const guide of repairGuides) {
      expect(guide.condition.length).toBeGreaterThan(30);
      expect(new URL(guide.source).protocol).toBe("https:");
      expect(guide.steps.length).toBe(3);
    }
  });
});
