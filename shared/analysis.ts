import { z } from "zod";

export const requestSchema = z.object({
  appliance: z.enum(["washer", "fridge", "fan", "small"]),
  symptom: z.string().trim().min(1).max(120),
  safety: z.enum(["yes", "no", "unsure"]),
  notes: z.string().max(2000).default(""),
  model: z.string().max(120).default(""),
  answers: z
    .record(z.string().max(240), z.string().max(400))
    .refine((value) => Object.keys(value).length <= 12)
    .default({}),
  photo: z
    .string()
    .max(1800000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/)
    .optional(),
  consent: z.literal(true),
});
export type AnalysisRequest = z.infer<typeof requestSchema>;
export const aiSchema = z.object({
  hazardDetected: z.boolean(),
  observations: z.array(z.string().max(500)).max(6),
  hypotheses: z
    .array(
      z.object({
        title: z.string().max(120),
        reason: z.string().max(500),
        uncertainty: z.string().max(300),
      }),
    )
    .max(4),
  questions: z.array(z.string().max(200)).max(3),
  unknowns: z.array(z.string().max(300)).max(5),
});
export type AIAnalysis = z.infer<typeof aiSchema>;
export const analysisSchema = aiSchema.extend({
  stop: z.boolean(),
  mode: z.enum(["ai", "safety"]),
  checks: z.array(z.string()),
  version: z.string(),
  model: z.string().optional(),
});
export type Analysis = AIAnalysis & {
  stop: boolean;
  mode: "ai" | "safety";
  checks: string[];
  version: string;
  model?: string;
};
export const version = "reparo-safety-2026-11-08.1";
const hazard =
  /smok|burn|spark|\bfire\b|\bflame|\bshock|electrocut|\bgas\b|carbon monoxide|exposed.{0,30}(wire|wiring)|refrigerant|flood|water.{0,40}(electric|socket|outlet|plug)|leak.{0,40}(electric|socket|outlet|plug)|microwave.{0,30}(capacitor|inside|internal)|bypass.{0,30}(lock|guard|interlock)/i;
export function mustStop(input: AnalysisRequest) {
  return (
    input.safety !== "no" ||
    hazard.test(
      [
        input.symptom,
        input.notes,
        input.model,
        ...Object.values(input.answers),
      ].join(" "),
    )
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
  return {
    ...ai,
    stop: false,
    mode: "ai",
    checks: approvedChecks(input.appliance),
    version,
    model,
  };
}
