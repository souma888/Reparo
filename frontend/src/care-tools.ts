import type { Case } from "./workshop-data";
export function repairDecision(
  age: number,
  quote: number,
  replacement: number,
  threshold = 50,
  warranty = false,
) {
  if (
    ![age, quote, replacement, threshold].every(Number.isFinite) ||
    age < 0 ||
    quote < 0 ||
    replacement <= 0 ||
    threshold < 1 ||
    threshold > 100
  )
    throw new Error(
      "Enter valid nonnegative amounts, a replacement price above zero, and a threshold from 1 to 100.",
    );
  const ratio = (quote / replacement) * 100;
  return {
    ratio,
    message: warranty
      ? "Check warranty coverage before paying for a repair."
      : ratio <= threshold
        ? "A repair quote is within your chosen cost threshold."
        : "Compare another repair quote with replacement options.",
    detail: `Repair is ${ratio.toFixed(1)}% of replacement; your threshold is ${threshold}%. Age ${age} years is recorded as context; no appliance lifespan is assumed. Safety, parts availability, energy use and environmental impact need separate consideration.`,
  };
}
export function recurringCases(
  cases: Case[],
  deviceId: string,
  now = new Date(),
) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - 6);
  const recent = cases.filter(
    (c) =>
      c.deviceId === deviceId &&
      !c.imported &&
      new Date(c.date) >= cutoff &&
      new Date(c.date) <= now,
  );
  const counts = new Map<string, number>();
  for (const c of recent)
    counts.set(c.symptom, (counts.get(c.symptom) || 0) + 1);
  return [...counts.entries()]
    .filter(([, count]) => count >= 3)
    .map(
      ([symptom, count]) =>
        `${count} cases for “${symptom}” in six months. Consider a technician review.`,
    );
}
