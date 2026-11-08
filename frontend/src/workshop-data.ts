import { z } from "zod";
import { analysisSchema } from "../../shared/analysis";

export function validDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
const day = z
  .string()
  .refine(
    (value) => value === "" || validDay(value),
    "Use a valid calendar date",
  );
export const deviceSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(80),
  category: z.enum(["washer", "fridge", "fan", "small"]),
  model: z.string().max(120),
  careDate: day,
  careIntervalDays: z.number().int().min(0).max(3650).optional(),
  lastCared: day.optional(),
});
export const caseSchema = z.object({
  id: z.string().min(1).max(100),
  date: z.iso.datetime(),
  appliance: z.enum(["washer", "fridge", "fan", "small"]),
  model: z.string().max(120),
  symptom: z.string().max(120),
  notes: z.string().max(2000),
  answers: z
    .record(z.string().max(240), z.string().max(400))
    .refine((v) => Object.keys(v).length <= 12)
    .default({}),
  result: analysisSchema.extend({
    checks: z.array(z.string().max(1000)).max(10),
  }),
  status: z.enum(["open", "resolved"]),
  rating: z.enum(["helpful", "unclear"]).optional(),
  imported: z.boolean().optional(),
});
export const dataSchema = z
  .object({
    version: z.literal(1),
    cases: z.array(caseSchema).max(100),
    devices: z.array(deviceSchema).max(50),
  })
  .superRefine((data, context) => {
    for (const key of ["cases", "devices"] as const)
      if (new Set(data[key].map((item) => item.id)).size !== data[key].length)
        context.addIssue({
          code: "custom",
          message: `Duplicate IDs in ${key}`,
        });
  });
export type Device = z.infer<typeof deviceSchema>;
export type Case = z.infer<typeof caseSchema>;
export type WorkshopData = z.infer<typeof dataSchema>;
const backupSchema = z
  .object({
    app: z.literal("reparo"),
    exportedAt: z.iso.datetime(),
    data: dataSchema,
  })
  .strict();
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
    `SUMMARY:${escapeCalendar(`Care reminder: ${device.name}`)}`,
    `DESCRIPTION:${escapeCalendar("Review the manufacturer manual and arrange safe routine care. This reminder does not indicate that the appliance is safe.")}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(foldCalendar)
    .join("\r\n");
}
