import { expect, it } from "vitest";
import cases from "../../evals/hazards.json";
import {
  hasHazard,
  finalize,
  requestSchema,
  type AIAnalysis,
} from "../../shared/analysis";
it("gates hazard recall and false-positive rate on a versioned 100+ phrase corpus", () => {
  const positive = cases.filter((c) => c.hazard),
    negative = cases.filter((c) => !c.hazard);
  const missed = positive.filter((c) => !hasHazard(c.text)),
    falseAlarms = negative.filter((c) => hasHazard(c.text));
  expect(cases.length).toBeGreaterThanOrEqual(100);
  expect(missed, JSON.stringify(missed)).toEqual([]);
  expect(
    falseAlarms.length / negative.length,
    JSON.stringify(falseAlarms),
  ).toBeLessThanOrEqual(0.025);
});
const input = requestSchema.parse({
  appliance: "washer",
  symptom: "Will not start",
  safety: "no",
  consent: true,
});
const base: AIAnalysis = {
  hazardDetected: false,
  observations: [],
  hypotheses: [],
  questions: [],
  unknowns: [],
};
it.each(["observations", "unknowns", "title", "reason", "uncertainty"])(
  "rejects procedures hidden in %s",
  (field) => {
    const instruction = "Open the panel and test the wire";
    const ai = {
      ...base,
      ...(["title", "reason", "uncertainty"].includes(field)
        ? {
            hypotheses: [
              {
                title: "A possibility",
                reason: "Unknown cause",
                uncertainty: "Unconfirmed",
                [field]: instruction,
              },
            ],
          }
        : { [field]: [instruction] }),
    };
    expect(finalize(input, ai, "test").mode).toBe("rules");
  },
);
