import * as z from "zod/mini";
import {
  analysisSchema,
  bounded,
  categories,
  type Analysis,
} from "../../shared/analysis";

export function validDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
const day = z
  .string()
  .check(z.refine((v) => v === "" || validDay(v), "Use a valid calendar date"));
const id = bounded(100).check(z.minLength(1));
export const deviceSchema = z.object({
  id,
  name: bounded(80).check(z.trim(), z.minLength(1)),
  category: z.enum(categories),
  model: bounded(120),
  careDate: day,
  careIntervalDays: z.optional(
    z.number().check(z.int(), z.minimum(0), z.maximum(3650)),
  ),
  lastCared: z.optional(day),
  purchaseDate: z.optional(day),
  warrantyExpiry: z.optional(day),
});
export const caseSchema = z.object({
  id,
  deviceId: z.optional(id),
  date: z.iso.datetime(),
  appliance: z.enum(categories),
  model: bounded(120),
  symptom: bounded(120),
  notes: bounded(2000),
  answers: z._default(
    z
      .record(bounded(240), bounded(400))
      .check(z.refine((v) => Object.keys(v).length <= 12)),
    {},
  ),
  result: analysisSchema,
  status: z.enum(["open", "resolved"]),
  rating: z.optional(z.enum(["helpful", "unclear"])),
  imported: z.optional(z.boolean()),
});
export const dataSchema = z
  .object({
    version: z.literal(1),
    cases: z.array(caseSchema).check(z.maxLength(100)),
    devices: z.array(deviceSchema).check(z.maxLength(50)),
  })
  .check(
    z.refine(
      (data) =>
        ["cases", "devices"].every((key) => {
          const items = data[key as "cases" | "devices"];
          return new Set(items.map((i) => i.id)).size === items.length;
        }),
      "Duplicate IDs",
    ),
  );
export type Device = z.infer<typeof deviceSchema>;
export type Case = Omit<z.infer<typeof caseSchema>, "result"> & {
  result: Analysis;
};
export type WorkshopData = { version: 1; cases: Case[]; devices: Device[] };
const backupSchema = z.strictObject({
  app: z.literal("reparo"),
  exportedAt: z.iso.datetime(),
  data: dataSchema,
});
export const maxBackupBytes = 2 * 1024 * 1024;
export function parseBackup(text: string): WorkshopData {
  if (new TextEncoder().encode(text).byteLength > maxBackupBytes)
    throw new Error("Backup must be smaller than 2 MB.");
  const parsed = backupSchema.safeParse(JSON.parse(text));
  if (!parsed.success)
    throw new Error("This is not a valid Reparo backup. Nothing was changed.");
  return parsed.data.data;
}
export function mergeBackup(
  current: WorkshopData,
  incoming: WorkshopData,
): WorkshopData {
  const existingCases = new Set(current.cases.map((c) => c.id)),
    existingDevices = new Set(current.devices.map((d) => d.id));
  const cases = [
    ...current.cases,
    ...incoming.cases
      .filter((c) => !existingCases.has(c.id))
      .map((c) => ({ ...c, imported: true })),
  ];
  const devices = [
    ...current.devices,
    ...incoming.devices.filter((d) => !existingDevices.has(d.id)),
  ];
  if (cases.length > 100 || devices.length > 50)
    throw new Error(
      "Import would exceed 100 cases or 50 appliances. No records were changed.",
    );
  return dataSchema.parse({ version: 1, cases, devices });
}
export function makeBackup(data: WorkshopData) {
  return JSON.stringify(
    {
      app: "reparo",
      exportedAt: new Date().toISOString(),
      data: dataSchema.parse(data),
    },
    null,
    2,
  );
}
export function localDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function addDays(day: string, days: number) {
  if (!validDay(day) || !Number.isInteger(days) || days < 0 || days > 3650)
    throw new Error("Invalid reminder date or interval.");
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function careStatus(device: Device, today = localDay()) {
  if (!device.careDate) return "No date";
  if (device.careDate < today) return "Overdue";
  if (device.careDate === today) return "Today";
  return device.careDate <= addDays(today, 7) ? "Due soon" : "Scheduled";
}
export function completeCare(device: Device, today = localDay()): Device {
  return {
    ...device,
    lastCared: today,
    careDate: device.careIntervalDays
      ? addDays(today, device.careIntervalDays)
      : "",
  };
}
function escapeCalendar(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
// RFC 5545: fold at 75 UTF-8 octets, preserving complete Unicode characters.
function foldCalendar(line: string) {
  let output = "",
    part = "",
    bytes = 0;
  for (const character of line) {
    const size = new TextEncoder().encode(character).length;
    if (bytes + size > 75) {
      output += part + "\r\n";
      part = " ";
      bytes = 1;
    }
    part += character;
    bytes += size;
  }
  return output + part;
}
export function calendarEvent(device: Device) {
  if (!validDay(device.careDate))
    throw new Error("Set a valid care date before adding it to a calendar.");
  const start = device.careDate.replaceAll("-", ""),
    end = addDays(device.careDate, 1).replaceAll("-", "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Reparo//Care reminders//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${encodeURIComponent(device.id)}-${start}@reparo.local`,
    `DTSTAMP:${new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    ...(device.careIntervalDays
      ? [`RRULE:FREQ=DAILY;INTERVAL=${device.careIntervalDays}`]
      : []),
    `SUMMARY:${escapeCalendar(`Care reminder: ${device.name}`)}`,
    `DESCRIPTION:${escapeCalendar("Review the manufacturer manual and arrange safe routine care. This reminder does not indicate that the appliance is safe.")}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(foldCalendar)
    .join("\r\n");
}
