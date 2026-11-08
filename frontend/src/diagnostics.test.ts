import { describe, expect, it } from "vitest";
import { getGuidance } from "./diagnostics";

describe("preview safety gate", () => {
  it.each(["yes", "unsure", ""] as const)(
    "stops when safety is %s",
    (safety) => {
      expect(getGuidance("washer", "Will not start", safety, "").stop).toBe(
        true,
      );
    },
  );
  it.each([
    "There is smoke",
    "a burning smell",
    "I got an electric shock",
    "suspected gas leak",
    "water near the electric socket",
    "exposed wiring",
    "sparks behind the drum",
    "refrigerant leak",
  ])("escalates hazard notes: %s", (notes) => {
    expect(getGuidance("washer", "Will not start", "no", notes).stop).toBe(
      true,
    );
  });
  it("offers only general observations when hazards are denied", () => {
    const result = getGuidance(
      "washer",
      "Will not start",
      "no",
      "The display reads E02",
    );
    expect(result.stop).toBe(false);
    expect(result.intro).toContain("not a diagnosis");
    expect(result.checks.join(" ")).toContain("do not bypass the door lock");
  });
  it("abstains from unsupported specific diagnoses", () => {
    const result = getGuidance(
      "small",
      "Something else",
      "no",
      "Stopped yesterday",
    );
    expect(result.intro).toContain("cause is unknown");
    expect(result.checks.join(" ")).toContain("qualified technician");
  });
});
