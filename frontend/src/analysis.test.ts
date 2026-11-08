import { describe, it, expect, vi } from "vitest";
import { analyze } from "../../server/analyze";
import {
  requestSchema,
  rulesResult,
  type AIAnalysis,
} from "../../shared/analysis";
import endpoint from "../../api/analyze";
const input = {
  appliance: "washer",
  symptom: "Will not start",
  safety: "no",
  notes: "Display shows E02",
  consent: true,
};
const generated: AIAnalysis = {
  hazardDetected: false,
  observations: ["Reported E02"],
  hypotheses: [
    {
      title: "Door state",
      reason: "Reported start issue",
      uncertainty: "Not confirmed",
    },
  ],
  questions: ["Was an error visible?"],
  unknowns: ["Exact model"],
};
describe("AI safety and validation", () => {
  it("never calls the model for an explicit hazard", async () => {
    const model = vi.fn();
    const result = await analyze({ ...input, safety: "yes" }, model);
    expect(result.stop).toBe(true);
    expect(model).not.toHaveBeenCalled();
  });
  it("cannot downgrade a hazard mentioned in follow-up answers", async () => {
    const model = vi.fn();
    expect(
      (
        await analyze(
          { ...input, answers: { followup: "smoke appears" } },
          model,
        )
      ).stop,
    ).toBe(true);
    expect(model).not.toHaveBeenCalled();
  });
  it("discards hypotheses when the model flags a photo hazard", async () => {
    const result = await analyze(input, async () => ({
      ...generated,
      hazardDetected: true,
    }));
    expect(result.stop).toBe(true);
    expect(result.hypotheses).toEqual([]);
  });
  it("combines structured AI with fixed safe actions", async () => {
    const result = await analyze(input, async () => generated);
    expect(result.mode).toBe("ai");
    expect(result.hypotheses).toHaveLength(1);
    expect(result.checks.join(" ")).toContain("Do not bypass");
  });
  it("drops AI follow-ups that ask the user to operate the appliance", async () => {
    const result = await analyze(input, async () => ({
      ...generated,
      questions: [
        "Does pressing and holding the start button change the display?",
        "Does the door seal properly after moving the food package?",
        "What error code was already visible?",
      ],
    }));
    expect(result.questions).toEqual(["What error code was already visible?"]);
  });
  it("rejects absent consent and unsupported appliance", () => {
    expect(requestSchema.safeParse({ ...input, consent: false }).success).toBe(
      false,
    );
    expect(
      requestSchema.safeParse({ ...input, appliance: "gas boiler" }).success,
    ).toBe(false);
  });
  it("rejects remote photo URLs and oversized notes", () => {
    expect(
      requestSchema.safeParse({
        ...input,
        photo: "https://example.com/image.jpg",
      }).success,
    ).toBe(false);
    expect(
      requestSchema.safeParse({ ...input, notes: "x".repeat(2001) }).success,
    ).toBe(false);
  });
  it("falls back to basic guidance for malformed AI responses", async () => {
    expect((await analyze(input, async () => ({}) as AIAnalysis)).mode).toBe(
      "rules",
    );
  });
  it("never calls a provider in explicit basic mode", async () => {
    const model = vi.fn();
    expect((await analyze({ ...input, mode: "rules" }, model)).mode).toBe(
      "rules",
    );
    expect(model).not.toHaveBeenCalled();
  });
  it("keeps the app usable on free-quota exhaustion without paid retries", async () => {
    const model = vi.fn().mockRejectedValue(new Error("429"));
    const result = await analyze(input, model);
    expect(result.mode).toBe("rules");
    expect(result.notice).toContain("No paid fallback");
    expect(model).toHaveBeenCalledTimes(1);
  });
  it("does not invent photo observations in fallback mode", () => {
    const result = rulesResult(
      requestSchema.parse({ ...input, photo: "data:image/jpeg;base64,AAAA" }),
    );
    expect(result.unknowns).toContain("The attached photo was not analyzed.");
    expect(result.hypotheses).toEqual([]);
  });
  it("never lets fallback bypass a safety stop", () => {
    expect(
      rulesResult(requestSchema.parse({ ...input, safety: "yes" })).stop,
    ).toBe(true);
  });
  it("rejects unsupported methods and cross-origin traffic", async () => {
    expect(
      (await endpoint.fetch(new Request("http://localhost/api/analyze")))
        .status,
    ).toBe(405);
    expect(
      (
        await endpoint.fetch(
          new Request("http://localhost/api/analyze", {
            method: "POST",
            headers: {
              origin: "https://elsewhere.test",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
          }),
        )
      ).status,
    ).toBe(403);
  });
  it("validates JSON before any provider call", async () => {
    expect(
      (
        await endpoint.fetch(
          new Request("http://localhost/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{bad",
          }),
        )
      ).status,
    ).toBe(400);
  });
  it("handles a safety request end-to-end without credentials", async () => {
    const response = await endpoint.fetch(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, safety: "unsure" }),
      }),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).mode).toBe("safety");
  });
});
