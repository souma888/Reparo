import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("ai", () => ({ generateText: vi.fn(), Output: { object: vi.fn() } }));
import { generateText } from "ai";
import { generateAnalysis, analyze } from "../../server/analyze";
import { requestSchema } from "../../shared/analysis";
const input = requestSchema.parse({
  appliance: "washer",
  symptom: "Will not start",
  safety: "no",
  notes: "The display shows E02",
  consent: true,
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("free provider policy", () => {
  it("uses the direct Google adapter and a fixed free-eligible model, ignoring gateway variables", async () => {
    vi.stubEnv("AI_GATEWAY_MODEL", "paid/provider-model");
    vi.mocked(generateText).mockResolvedValue({
      output: {
        hazardDetected: false,
        observations: [],
        hypotheses: [],
        questions: [],
        unknowns: [],
      },
    } as never);
    await generateAnalysis(input);
    const call = vi.mocked(generateText).mock.calls[0][0];
    expect(call.model).toMatchObject({
      modelId: "gemini-3.5-flash-lite",
      provider: "google.generative-ai",
    });
    expect(call.maxRetries).toBe(0);
    expect(call.maxOutputTokens).toBe(1800);
    expect(call.tools).toBeUndefined();
  });
  it("makes no AI call with no Google key even when Gateway is configured", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
    vi.stubEnv("AI_GATEWAY_API_KEY", "unused-test-value");
    const result = await analyze(input);
    expect(result.mode).toBe("rules");
    expect(generateText).not.toHaveBeenCalled();
  });
});
