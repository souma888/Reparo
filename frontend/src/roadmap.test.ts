import benchmark from "../../evals/retrieval.json";
import { expect, it, vi, afterEach } from "vitest";
import { repairDecision, recurringCases } from "./care-tools";
import { retrieve } from "../../shared/retrieval";
import { analyze } from "../../server/analyze";
import sync from "../../api/sync";
import { freeModel } from "../../server/model";
import { calendarEvent, type Case } from "./workshop-data";
import {
  finalize,
  requestSchema,
  type AIAnalysis,
} from "../../shared/analysis";
afterEach(() => vi.unstubAllEnvs());
it("cost comparison keeps the user threshold transparent and validates impossible prices", () => {
  expect(repairDecision(4, 200, 1000).ratio).toBe(20);
  expect(repairDecision(4, 800, 1000).message).toContain("another");
  expect(repairDecision(1, 200, 1000, 50, true).message).toContain("warranty");
  expect(() => repairDecision(1, 20, 0)).toThrow();
});
const manual = {
  id: "m1",
  title: "Example manual",
  model: "X-123",
  brand: "Example",
  revision: "1",
  source: "https://example.com/manual",
  pages: [
    "Display E02 means delayed start. No instruction.",
    "Warranty information.",
  ],
};
it("retrieval cites a real page and refuses nearby models", () => {
  expect(retrieve([manual], "X123", "E02")).toMatchObject([
    { page: 1, model: "X-123" },
  ]);
  expect(retrieve([manual], "X124", "E02")).toEqual([]);
  expect(retrieve([manual], "", "E02")).toEqual([]);
  expect(retrieve([manual], "X123", "unrelated")).toEqual([]);
});
it("rejects invented manual citations", () => {
  const input = requestSchema.parse({
    appliance: "washer",
    symptom: "E02",
    safety: "no",
    consent: true,
    model: "X123",
    manualPassages: retrieve([manual], "X123", "E02"),
  });
  const ai: AIAnalysis = {
    hazardDetected: false,
    observations: [],
    hypotheses: [],
    questions: [],
    unknowns: [],
    citations: ["made-up", "m1:p1:c1"],
  };
  expect(finalize(input, ai, "test").citations).toEqual(["m1:p1:c1"]);
});
it("calendar export includes a recurring rule only when requested", () => {
  const d = {
    id: "1",
    name: "Fan",
    category: "fan" as const,
    model: "",
    careDate: "2026-11-20",
  };
  expect(calendarEvent({ ...d, careIntervalDays: 30 })).toContain(
    "RRULE:FREQ=DAILY;INTERVAL=30",
  );
  expect(calendarEvent(d)).not.toContain("RRULE");
});
it("recurrence counts only linked recent local cases", () => {
  const now = new Date("2026-11-08");
  const c = {
    id: "1",
    deviceId: "d",
    date: "2026-11-01T00:00:00Z",
    symptom: "Not draining",
  } as Case;
  expect(
    recurringCases([c, { ...c, id: "2" }, { ...c, id: "3" }], "d", now),
  ).toHaveLength(1);
  expect(
    recurringCases(
      [c, { ...c, deviceId: "x" }, { ...c, imported: true }],
      "d",
      now,
    ),
  ).toEqual([]);
});
it("unknown model configuration fails closed", async () => {
  vi.stubEnv("GOOGLE_AI_MODEL", "paid-model");
  vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test");
  expect(() => freeModel()).toThrow();
  expect(
    (
      await analyze({
        appliance: "washer",
        symptom: "E02",
        safety: "no",
        consent: true,
      })
    ).mode,
  ).toBe("rules");
});
it("cloud endpoint denies unsigned and wrong-origin requests before data access", async () => {
  vi.stubEnv("DATABASE_URL", "postgres://unused");
  vi.stubEnv("NEON_AUTH_BASE_URL", "https://auth.example.com/auth");
  expect(
    (await sync.fetch(new Request("https://reparo.example/api/sync"))).status,
  ).toBe(401);
  expect(
    (
      await sync.fetch(
        new Request("https://reparo.example/api/sync", {
          method: "PUT",
          headers: { Origin: "https://evil.example" },
        }),
      )
    ).status,
  ).toBe(403);
});

it("retrieval beats the no-retrieval baseline on a declared synthetic citation benchmark", () => {
  let hits = 0;
  for (const c of benchmark) {
    const pages = retrieve([manual], c.model, c.query);
    if (c.expectedPage === null) {
      expect(pages).toEqual([]);
    } else {
      expect(pages[0]?.page).toBe(c.expectedPage);
      hits++;
    }
  }
  expect(hits).toBe(3); // Rules-only baseline provides zero document citations, retrieval provides 3/3 supported references.
});
