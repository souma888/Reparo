import * as z from "zod/mini";
export const categories = [
  "washer",
  "fridge",
  "fan",
  "small",
  "dishwasher",
  "vacuum",
  "air-purifier",
  "water-purifier",
  "mixer-grinder",
] as const;
export const bounded = (max: number) => z.string().check(z.maxLength(max));
const list = (max: number, length: number) =>
  z.array(bounded(length)).check(z.maxLength(max));
export const passageSchema = z.object({
  id: bounded(160),
  title: bounded(120),
  page: z.number().check(z.int(), z.minimum(1), z.maximum(100)),
  quote: bounded(900),
  source: bounded(500).check(
    z.refine((v) => v === "" || /^https:\/\//.test(v)),
  ),
  model: bounded(120),
});
export const requestSchema = z.object({
  appliance: z.enum(categories),
  symptom: bounded(120).check(z.trim(), z.minLength(1)),
  safety: z.enum(["yes", "no", "unsure"]),
  notes: z._default(bounded(2000), ""),
  model: z._default(bounded(120), ""),
  deviceId: z.optional(bounded(100)),
  manualPassages: z._default(z.array(passageSchema).check(z.maxLength(3)), []),
  answers: z._default(
    z
      .record(bounded(240), bounded(400))
      .check(z.refine((v) => Object.keys(v).length <= 12)),
    {},
  ),
  photo: z.optional(
    bounded(1800000).check(
      z.regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/),
    ),
  ),
  consent: z.literal(true),
  mode: z._default(z.enum(["ai", "rules"]), "ai"),
});
export type AnalysisRequest = Omit<
  z.infer<typeof requestSchema>,
  "manualPassages"
> & { manualPassages?: z.infer<typeof passageSchema>[] };
export const aiSchema = z.object({
  hazardDetected: z.boolean(),
  observations: list(6, 500),
  hypotheses: z
    .array(
      z.object({
        title: bounded(120),
        reason: bounded(500),
        uncertainty: bounded(300),
      }),
    )
    .check(z.maxLength(4)),
  questions: list(3, 200),
  unknowns: list(5, 300),
  citations: z._default(list(3, 160), []),
});
export type AIAnalysis = Omit<z.infer<typeof aiSchema>, "citations"> & {
  citations?: string[];
};
export const analysisSchema = z.extend(aiSchema, {
  stop: z.boolean(),
  mode: z.enum(["ai", "safety", "rules"]),
  notice: z.optional(bounded(1000)),
  sources: z._default(z.array(passageSchema).check(z.maxLength(3)), []),
  checks: list(10, 1000),
  version: bounded(100),
  model: z.optional(bounded(120)),
});
export type Analysis = Omit<
  z.infer<typeof analysisSchema>,
  "citations" | "sources"
> & { citations?: string[]; sources?: z.infer<typeof passageSchema>[] };
export const version = "reparo-safety-2026-11-08.2";
// One gate for all entry points. Explicit safety answers can only escalate.
export function hasHazard(text: string) {
  const normalized = text.normalize("NFKC").toLowerCase();
  // A toast-like odor attributed to electrical equipment is still a hazard.
  if (
    /burn(?:t|ed) toast[^.!?\n]{0,60}(?:cord|wir(?:e|ing)|plug|socket|outlet|motor|breaker|panel)|(?:cord|wir(?:e|ing)|plug|socket|outlet|motor|breaker|panel)[^.!?\n]{0,60}burn(?:t|ed) toast/.test(
      normalized,
    )
  )
    return true;
  // A food-only burnt-toast report is a benign decoy, never an exemption for other hazards.
  const evidence = normalized.replace(
    /burn(?:t|ed) toast(?: smell)?/g,
    "food odor",
  );
  return /smok|burn|spark|\bfire\b|\bflame|\bshock|electrocut|\bgas\b|carbon monoxide|refrigerant|flood|overheat|hot to (?:the )?touch|too hot|melt(?:ed|ing).{0,20}plastic|plastic.{0,20}melt|crackl|\barc(?:ing|s)?\b|electrical (?:smell|odor|odour)|(?:breaker|rcd|fuse).{0,30}(?:trip|blow)|(?:trip|blow).{0,30}(?:breaker|rcd|fuse)|(?:fray|damag|expos|split|bare).{0,30}(?:cord|cable|wir(?:e|ing))|(?:cord|cable|wir(?:e|ing)).{0,30}(?:fray|damag|expos|split|bare)|(?:water|leak|puddle|wet).{0,40}(?:electric|socket|outlet|plug)|(?:socket|outlet|plug).{0,40}(?:water|leak|puddle|wet)|microwave.{0,30}(?:capacitor|inside|internal)|bypass.{0,30}(?:lock|guard|interlock)|धुआँ|धुआं|चिंगारी|करंट|गैस|जलने की गंध|तार.{0,15}खुल|ब्रेकर.{0,15}ट्रिप/i.test(
    evidence,
  );
}
export function mustStop(input: AnalysisRequest) {
  return (
    input.safety !== "no" ||
    hasHazard(
      [
        input.symptom,
        input.notes,
        input.model,
        ...Object.values(input.answers),
      ].join(" "),
    )
  );
}
// Reject procedural instructions in every generated field before displaying output.
export function unsafeInstruction(text: string): boolean {
  return /(?:^|[.!?]\s+)(?:please\s+)?(?:open|remove|unscrew|dismantle|disassemble|bypass|touch|probe|rewire|disconnect|move|reposition|adjust|reset|reconnect|clean|wipe|plug|unplug|press|hold|push|run|operate|switch|turn|test)\s+(?:it|the|a|your|this|that)\b|पैनल खोल|खोलें|निकालें|चलाएँ|बायपास|(?:\b(?:please|you should|you can|you must|try to|need to)\s+)?\b(?:open|remove|unscrew|dismantle|disassemble|bypass|short|bridge|touch|probe|rewire|replace|disconnect|move|reposition|adjust|reset|reconnect|clean|wipe|plug|unplug|press|hold|push|run|operate|switch|turn|test)\b.{0,65}\b(?:panel|cover|guard|wire|wiring|terminal|capacitor|interlock|socket|outlet|plug|power|button|cycle|appliance|device|machine|motor|start|screw|fuse|breaker)\b|\b(?:pressing|holding|opening|removing|bypassing|testing)\b.{0,50}\b(?:button|panel|guard|wire|power|start)\b/i.test(
    text,
  );
}
export function safetyResult(): Analysis {
  return {
    stop: true,
    mode: "safety",
    hazardDetected: true,
    observations: [],
    hypotheses: [],
    questions: [],
    unknowns: [
      "The appliance has not been inspected and cannot be certified safe.",
    ],
    version,
    checks: [
      "Stop using the appliance. Keep people away. Do not touch, open, or attempt to repair it.",
      "For fire, smoke, a suspected gas leak, or immediate danger, move to a safe place and contact local emergency services. Do not operate electrical switches near a suspected gas leak.",
      "Arrange an inspection by a qualified technician before using the appliance again.",
    ],
  };
}
export function approvedChecks(appliance: string): string[] {
  const specific: Record<string, string> = {
    washer:
      "Record the visible error code and whether the door appears closed. Do not bypass the door lock, open panels, or repeat a cycle to reproduce a fault.",
    fridge:
      "From outside, note whether food packages obstruct the door. Do not remove panels, move the appliance, or handle refrigerant.",
    fan: "Observe obstructions from a safe distance. Keep hands and objects outside the guard and do not remove it.",
    small:
      "Record the visible error message or indicator light. Do not dismantle the appliance or test exposed wiring.",
  };
  return [
    "Read your exact model’s manufacturer manual and its safety instructions before taking action.",
    specific[appliance] || specific.small,
    "If symptoms persist, share this summary with a qualified technician. Stop immediately if any new hazard appears.",
  ];
}
export function finalize(
  input: AnalysisRequest,
  ai: AIAnalysis,
  model: string,
): Analysis {
  if (mustStop(input) || ai.hazardDetected) return safetyResult();
  const prose = [
    ...ai.observations,
    ...ai.unknowns,
    ...ai.hypotheses.flatMap((h) => [h.title, h.reason, h.uncertainty]),
  ];
  if (prose.some(unsafeInstruction))
    return rulesResult(
      input,
      "AI output did not pass the instruction safety check. Showing basic guidance instead.",
    );
  return {
    ...ai,
    // Even interrogative phrasing can ask the user to operate a faulty device.
    // Discard such follow-ups rather than relying only on the model prompt.
    citations: (ai.citations || []).filter((id) =>
      input.manualPassages?.some(
        (p) =>
          p.id === id &&
          p.model.replace(/[^a-z0-9]/gi, "").toLowerCase() ===
            input.model.replace(/[^a-z0-9]/gi, "").toLowerCase(),
      ),
    ),
    sources: (input.manualPassages || []).filter(
      (p) =>
        (ai.citations || []).includes(p.id) &&
        p.model.replace(/[^a-z0-9]/gi, "").toLowerCase() ===
          input.model.replace(/[^a-z0-9]/gi, "").toLowerCase(),
    ),
    questions: ai.questions.filter(
      (question) =>
        !/(press|hold|push|run|operat|switch|turn|touch|plug|test|open|remov|disassembl|bypass|mov|reposition|adjust|reset|reconnect|clean|wipe|replace|try|what happens if)/i.test(
          question,
        ),
    ),
    stop: false,
    mode: "ai",
    checks: approvedChecks(input.appliance),
    version,
    model,
  };
}
export function rulesResult(
  input: AnalysisRequest,
  notice = "You chose the free basic guide. No AI request was made.",
): Analysis {
  if (mustStop(input)) return safetyResult();
  return {
    stop: false,
    mode: "rules",
    hazardDetected: false,
    observations: [
      `Reported symptom: ${input.symptom}`,
      ...(input.notes ? [`Your notes: ${input.notes}`] : []),
    ],
    hypotheses: [],
    questions: [],
    unknowns: [
      "The cause is unknown. These are general checks, not a diagnosis.",
      ...(input.photo ? ["The attached photo was not analyzed."] : []),
    ],
    checks: approvedChecks(input.appliance),
    version,
    notice,
  };
}
