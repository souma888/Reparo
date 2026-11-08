import { z } from "zod";
export const visionRequestSchema = z.object({
  photo: z
    .string()
    .max(1800000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/),
  issue: z.string().max(1000).default(""),
  consent: z.literal(true),
});
export type VisionRequest = z.infer<typeof visionRequestSchema>;
export const visionResultSchema = z.object({
  category: z.enum([
    "washer",
    "fridge",
    "fan",
    "small",
    "unsupported",
    "unknown",
  ]),
  deviceName: z.string().max(100),
  brand: z.string().max(80),
  modelNumber: z.string().max(100),
  recognition: z.enum(["clear", "tentative", "unknown"]),
  uncertainty: z.string().max(500),
  observations: z.array(z.string().max(300)).max(5),
  visibleIssues: z.array(z.string().max(300)).max(4),
  hazardDetected: z.boolean(),
  hazardReason: z.string().max(300),
});
export type VisionResult = z.infer<typeof visionResultSchema>;
