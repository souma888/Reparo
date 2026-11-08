import { vi, it, expect, afterEach } from "vitest";
vi.mock("../../server/analyze", () => ({
  analyze: vi.fn(async (input) => ({
    ...input,
    mode: input.mode === "rules" ? "rules" : "ai",
  })),
  streamAnalysis: vi.fn(),
}));
import endpoint from "../../api/analyze";
import { analyze } from "../../server/analyze";
afterEach(() => vi.unstubAllEnvs());
it("rules, invalid input and safety stops do not consume the five provider attempts", async () => {
  vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test");
  vi.stubEnv("DATABASE_URL", "");
  const input = {
    appliance: "washer",
    symptom: "E02",
    safety: "no",
    consent: true,
  };
  const send = (body: unknown) =>
    endpoint.fetch(
      new Request("https://reparo.test/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vercel-forwarded-for": "rate-test-unique",
        },
        body: JSON.stringify(body),
      }),
    );
  for (let i = 0; i < 6; i++) {
    await send({ ...input, mode: "rules" });
    await send({ ...input, safety: "yes" });
    expect((await send({ ...input, consent: false })).status).toBe(400);
  }
  vi.mocked(analyze).mockClear();
  for (let i = 0; i < 5; i++)
    expect((await (await send(input)).json()).mode).toBe("ai");
  expect(analyze).toHaveBeenCalledTimes(5);
  expect((await (await send(input)).json()).mode).toBe("rules");
  expect(analyze).toHaveBeenCalledTimes(5);
});
