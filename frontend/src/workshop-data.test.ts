import { describe, it, expect } from "vitest";
import {
  addDays,
  calendarEvent,
  careStatus,
  completeCare,
  dataSchema,
  makeBackup,
  mergeBackup,
  parseBackup,
  validDay,
  type Device,
  type WorkshopData,
} from "./workshop-data";
const device: Device = {
  id: "washer-1",
  name: "Laundry washer",
  category: "washer",
  model: "ABC",
  careDate: "2026-11-08",
  careIntervalDays: 30,
};
const empty: WorkshopData = { version: 1, cases: [], devices: [] };
describe("workspace backup integrity", () => {
  it("round-trips an actual versioned workspace", () => {
    const data = { ...empty, devices: [device] };
    expect(parseBackup(makeBackup(data))).toEqual(data);
  });
  it("merges without replacing existing records sharing an ID", () => {
    const merged = mergeBackup(
      { ...empty, devices: [device] },
      {
        ...empty,
        devices: [
          { ...device, name: "Changed externally" },
          { ...device, id: "fan-2", name: "Second appliance" },
        ],
      },
    );
    expect(merged.devices.map((d) => d.name)).toEqual([
      "Laundry washer",
      "Second appliance",
    ]);
  });
  it("is idempotent when the same backup is imported twice", () => {
    const once = mergeBackup(empty, { ...empty, devices: [device] });
    expect(mergeBackup(once, once)).toEqual(once);
  });
  it("rejects corrupt, unsupported, and oversized files", () => {
    expect(() => parseBackup("{bad")).toThrow();
    expect(() =>
      parseBackup(JSON.stringify({ app: "other", data: empty })),
    ).toThrow();
    expect(() => parseBackup(" ".repeat(2 * 1024 * 1024 + 1))).toThrow("2 MB");
  });
  it("rejects duplicate record IDs", () => {
    expect(
      dataSchema.safeParse({ ...empty, devices: [device, device] }).success,
    ).toBe(false);
  });
  it("rejects over-capacity merge without truncating current records", () => {
    const current = {
      ...empty,
      devices: Array.from({ length: 50 }, (_, i) => ({
        ...device,
        id: `device-${i}`,
      })),
    };
    expect(() => mergeBackup(current, { ...empty, devices: [device] })).toThrow(
      "50 appliances",
    );
    expect(current.devices).toHaveLength(50);
  });
  it("marks imported analyses as archives", () => {
    const item = {
      id: "case-1",
      date: "2026-11-08T00:00:00.000Z",
      appliance: "washer" as const,
      model: "ABC",
      symptom: "Unusual noise",
      notes: "Existing observation",
      answers: {},
      status: "open" as const,
      result: {
        stop: false,
        mode: "rules" as const,
        hazardDetected: false,
        observations: [],
        hypotheses: [],
        questions: [],
        unknowns: [],
        checks: [],
        version: "v1",
      },
    };
    expect(
      mergeBackup(empty, { ...empty, cases: [item] }).cases[0].imported,
    ).toBe(true);
  });
  it("accepts old device records without new optional reminder fields", () => {
    const { careIntervalDays, ...old } = device;
    expect(dataSchema.safeParse({ ...empty, devices: [old] }).success).toBe(
      true,
    );
  });
});
describe("calendar dates and care records", () => {
  it("rejects impossible dates rather than normalizing them", () => {
    expect(validDay("2026-02-30")).toBe(false);
    expect(validDay("2024-02-29")).toBe(true);
  });
  it("handles leap days, year boundaries, and DST without shifting dates", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
  });
  it("distinguishes overdue, today and upcoming dates", () => {
    expect(careStatus(device, "2026-11-09")).toBe("Overdue");
    expect(careStatus(device, "2026-11-08")).toBe("Today");
    expect(careStatus(device, "2026-11-04")).toBe("Due soon");
  });
  it("schedules the next reminder from completion, not the old due date", () => {
    const next = completeCare(device, "2026-11-10");
    expect(next.lastCared).toBe("2026-11-10");
    expect(next.careDate).toBe("2026-12-10");
  });
  it("clears a one-off reminder when completed", () => {
    expect(
      completeCare({ ...device, careIntervalDays: 0 }, "2026-11-10").careDate,
    ).toBe("");
  });
  it("exports an all-day event with exclusive end date and escaped text", () => {
    const text = calendarEvent({
      ...device,
      name: "Washer, test;\nBEGIN:VEVENT",
    }).replace(/\r\n /g, "");
    expect(text).toContain("DTSTART;VALUE=DATE:20261108");
    expect(text).toContain("DTEND;VALUE=DATE:20261109");
    expect(text.match(/^BEGIN:VEVENT$/gm)).toHaveLength(1);
    expect(text).toContain("Washer\\, test\\;\\nBEGIN:VEVENT");
  });
  it("folds Unicode lines without breaking characters or exceeding 75 bytes", () => {
    const text = calendarEvent({ ...device, name: "洗衣机".repeat(25) });
    for (const line of text.split("\r\n"))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(text.replace(/\r\n /g, "")).toContain("洗衣机".repeat(25));
  });
});
