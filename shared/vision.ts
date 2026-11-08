import * as z from "zod/mini";
export const visionRequestSchema = z.object({
  photo: z
    .string()
    .check(z.maxLength(1800000))
    .check(z.regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/)),
  issue: z._default(z.string().check(z.maxLength(1000)), ""),
  consent: z.literal(true),
});
export type VisionRequest = z.infer<typeof visionRequestSchema>;
export const visionResultSchema = z.object({
  category: z.enum([
    "washer",
    "fridge",
    "fan",
    "small",
    "dishwasher",
    "vacuum",
    "air-purifier",
    "water-purifier",
    "mixer-grinder",
    "unsupported",
    "unknown",
  ]),
  deviceName: z.string().check(z.maxLength(100)),
  brand: z.string().check(z.maxLength(80)),
  modelNumber: z.string().check(z.maxLength(100)),
  recognition: z.enum(["clear", "tentative", "unknown"]),
  uncertainty: z.string().check(z.maxLength(500)),
  observations: z
    .array(z.string().check(z.maxLength(300)))
    .check(z.maxLength(5)),
  visibleIssues: z
    .array(z.string().check(z.maxLength(300)))
    .check(z.maxLength(4)),
  hazardDetected: z.boolean(),
  hazardReason: z.string().check(z.maxLength(300)),
});
export type VisionResult = z.infer<typeof visionResultSchema>;
