import { useState } from "react";
import { z } from "zod";
import {
  aiSchema,
  type Analysis,
  type AnalysisRequest,
} from "../../shared/analysis";
const analysisSchema = aiSchema.extend({
  stop: z.boolean(),
  mode: z.enum(["ai", "safety"]),
  checks: z.array(z.string()),
  version: z.string(),
  model: z.string().optional(),
});
const caseSchema = z.object({
  id: z.string(),
  date: z.string(),
  appliance: z.enum(["washer", "fridge", "fan", "small"]),
  model: z.string(),
  symptom: z.string(),
  notes: z.string(),
  answers: z.record(z.string(), z.string()).default({}),
  result: analysisSchema,
  status: z.enum(["open", "resolved"]),
  rating: z.enum(["helpful", "unclear"]).optional(),
});
const deviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  category: z.enum(["washer", "fridge", "fan", "small"]),
  model: z.string().max(120),
  careDate: z.string().max(10),
});
export type Case = z.infer<typeof caseSchema>;
export type Device = z.infer<typeof deviceSchema>;
const dataSchema = z.object({
  version: z.literal(1),
  cases: z.array(caseSchema).max(100),
  devices: z.array(deviceSchema).max(50),
});
const storageKey = "reparo-workshop-v1";
export function useWorkshop() {
  const [error, setError] = useState("");
  const [data, setData] = useState<z.infer<typeof dataSchema>>(() => {
    try {
      return dataSchema.parse(
        JSON.parse(localStorage.getItem(storageKey) || "null"),
      );
    } catch {
      return { version: 1, cases: [], devices: [] };
    }
  });
  function persist(next: typeof data) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setData(next);
      setError("");
      return true;
    } catch {
      setError(
        "This browser could not save your data. Download a summary instead.",
      );
      return false;
    }
  }
  return {
    data,
    error,
    saveCase: (input: AnalysisRequest, result: Analysis) =>
      persist({
        ...data,
        cases: [
          {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            appliance: input.appliance,
            model: input.model,
            symptom: input.symptom || "Safety concern",
            notes: input.notes,
            answers: input.answers,
            result,
            status: "open" as const,
          },
          ...data.cases,
        ].slice(0, 100),
      }),
    deleteCase: (id: string) =>
      persist({ ...data, cases: data.cases.filter((c) => c.id !== id) }),
    updateCase: (id: string, patch: Partial<Pick<Case, "status" | "rating">>) =>
      persist({
        ...data,
        cases: data.cases.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }),
    addDevice: (device: Omit<Device, "id">) =>
      persist({
        ...data,
        devices: [
          ...data.devices,
          { ...device, id: crypto.randomUUID() },
        ].slice(-50),
      }),
    deleteDevice: (id: string) =>
      persist({ ...data, devices: data.devices.filter((d) => d.id !== id) }),
  };
}
export type Workshop = ReturnType<typeof useWorkshop>;
export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function summary(
  input: Pick<AnalysisRequest, "appliance" | "model" | "symptom" | "notes"> & {
    answers?: Record<string, string>;
  },
  result?: Analysis,
) {
  return [
    "REPARO — TECHNICIAN HANDOFF",
    `Appliance: ${input.appliance}`,
    `Model: ${input.model || "Unknown"}`,
    `Symptom: ${input.symptom}`,
    `User notes: ${input.notes || "None"}`,
    ...Object.entries(input.answers || {}).map(([q, a]) => `${q}: ${a}`),
    result
      ? `Safety: ${result.stop ? "STOP — professional help needed" : "No reported hazard; not a safety certification"}`
      : "AI analysis not completed",
    ...(result
      ? [
          `Observations: ${result.observations.join("; ")}`,
          ...result.hypotheses.map(
            (h) =>
              `Possible explanation: ${h.title}\nReason: ${h.reason}\nUncertainty: ${h.uncertainty}`,
          ),
          `Unknowns: ${result.unknowns.join("; ")}`,
          `Next steps:\n${result.checks.join("\n")}`,
          `Rules: ${result.version}; Model: ${result.model || "No AI call"}`,
        ]
      : []),
    "Informational guidance only. Have a qualified technician assess persistent symptoms.",
  ].join("\n\n");
}
