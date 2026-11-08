import { it, expect, vi, afterEach } from "vitest";
vi.mock("ai", () => ({
  streamText: vi.fn(),
  generateText: vi.fn(),
  Output: { object: vi.fn() },
}));
import { streamText } from "ai";
import { streamAnalysis } from "../../server/analyze";
import { requestSchema } from "../../shared/analysis";
afterEach(() => vi.restoreAllMocks());
it("suppresses provider error logging and falls back without exposing raw evidence", async () => {
  const rawError = new Error("private provider request body");
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(streamText).mockImplementation((options) => {
    options.onError?.({ error: rawError });
    return {
      partialOutputStream: (async function* () {
        throw rawError;
        yield undefined;
      })(),
      output: Promise.resolve({}),
    } as never;
  });
  const input = requestSchema.parse({
    appliance: "washer",
    symptom: "E02",
    safety: "no",
    consent: true,
  });
  const response = await streamAnalysis(input).text();
  expect(response).toContain('"mode":"rules"');
  expect(response).not.toContain(rawError.message);
  expect(log).not.toHaveBeenCalled();
});
