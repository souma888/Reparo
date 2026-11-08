import { useState, useEffect } from "react";
import {
  dataSchema,
  deviceSchema,
  mergeBackup,
  completeCare,
  type WorkshopData,
  type Device,
  type Case,
} from "./workshop-data";
export type { Device, Case } from "./workshop-data";
import { type Analysis, type AnalysisRequest } from "../../shared/analysis";
const storageKey = "reparo-workshop-v1";
export function useWorkshop() {
  const [error, setError] = useState("");
  const [data, setData] = useState<WorkshopData>(() => {
    try {
      return dataSchema.parse(
        JSON.parse(localStorage.getItem(storageKey) || "null"),
      );
    } catch {
      return { version: 1, cases: [], devices: [] };
    }
  });
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      try {
        setData(
          event.newValue
            ? dataSchema.parse(JSON.parse(event.newValue))
            : { version: 1, cases: [], devices: [] },
        );
      } catch {
        setError(
          "Another tab contains invalid saved data. This tab kept its records.",
        );
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function persist(next: typeof data) {
    const parsed = dataSchema.safeParse(next);
    if (!parsed.success) {
      setError(
        "Could not save: check the record details and the limits of 50 appliances and 100 cases. Existing records were preserved.",
      );
      return false;
    }
    try {
      const checked = parsed.data;
      localStorage.setItem(storageKey, JSON.stringify(checked));
      setData(checked);
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
    importData: (incoming: WorkshopData) => {
      try {
        return persist(mergeBackup(data, incoming));
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "The backup could not be imported.",
        );
        return false;
      }
    },
    updateDevice: (id: string, patch: Omit<Device, "id">) =>
      persist({
        ...data,
        devices: data.devices.map((d) =>
          d.id === id ? deviceSchema.parse({ ...patch, id }) : d,
        ),
      }),
    completeCare: (id: string) =>
      persist({
        ...data,
        devices: data.devices.map((d) => (d.id === id ? completeCare(d) : d)),
      }),
    saveCase: (input: AnalysisRequest, result: Analysis) =>
      persist({
        ...data,
        cases: [
          {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            appliance: input.appliance,
            deviceId: input.deviceId,
            model: input.model,
            symptom: input.symptom || "Safety concern",
            notes: input.notes,
            answers: input.answers,
            result,
            status: "open" as const,
          },
          ...data.cases,
        ],
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
        devices: [...data.devices, { ...device, id: crypto.randomUUID() }],
      }),
    deleteDevice: (id: string) =>
      persist({ ...data, devices: data.devices.filter((d) => d.id !== id) }),
  };
}
export type Workshop = ReturnType<typeof useWorkshop>;
export function downloadText(
  name: string,
  text: string,
  mime = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
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
    ...(result ? [`Analysis mode: ${result.mode}`, result.notice || ""] : []),
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
          ...(result.sources || []).map(
            (p) =>
              `Manual reference: ${p.title}, model ${p.model}, page ${p.page}; ${p.source || "local document"}. User-supplied applicability.`,
          ),
          `Next steps:\n${result.checks.join("\n")}`,
          `Rules: ${result.version}; Model: ${result.model || "No AI call"}`,
        ]
      : []),
    "Informational guidance only. Have a qualified technician assess persistent symptoms.",
  ].join("\n\n");
}

// Bounded print brief keeps safety and approved next steps ahead of lengthy notes.
export function technicianBrief(
  input: Pick<AnalysisRequest, "appliance" | "model" | "symptom" | "notes">,
  result: Analysis,
) {
  const short = (text: string, max: number) =>
    text.replace(/\s+/g, " ").trim().slice(0, max);
  return [
    "REPARO — TECHNICIAN BRIEF",
    `Appliance: ${input.appliance} · Model: ${short(input.model || "Unknown", 100)}`,
    `Safety: ${result.stop ? "STOP — do not use; emergency/professional help required" : "No reported hazard; not a safety certification"}`,
    `Symptom: ${short(input.symptom, 120)}`,
    `Notes: ${short(input.notes || "None", 350)}`,
    "APPROVED NEXT STEPS",
    ...result.checks.slice(0, 3).map((s) => short(s, 300)),
    "EVIDENCE",
    ...result.observations.slice(0, 3).map((s) => short(s, 150)),
    ...result.hypotheses
      .slice(0, 2)
      .map(
        (h) =>
          `Unverified possibility: ${short(h.title, 90)} — ${short(h.reason, 140)}`,
      ),
    `Unknowns: ${short(result.unknowns.join("; "), 240)}`,
    `Mode: ${result.mode} · Rules: ${result.version}`,
    "Condensed one-page brief. Use the downloaded text summary for all observations and citations. Guidance is informational; persistent faults need a qualified technician.",
  ].join("\n\n");
}
