import { identify } from "../server/vision.js";
import { ZodError } from "zod";
export const maxDuration = 40;
const hits = new Map<string, { count: number; until: number }>();
export default {
  async fetch(request: Request) {
    const reply = (body: unknown, status = 200) =>
      Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
    if (request.method !== "POST")
      return new Response(null, { status: 405, headers: { Allow: "POST" } });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      return reply({ error: "Cross-origin requests are not allowed." }, 403);
    if (!request.headers.get("content-type")?.includes("application/json"))
      return reply({ error: "Use JSON." }, 415);
    const now = Date.now();
    for (const [key, value] of hits) if (value.until < now) hits.delete(key);
    const ip = request.headers.get("x-vercel-forwarded-for") || "local";
    const entry = hits.get(ip) || { count: 0, until: now + 3600000 };
    if (entry.count >= 20 || hits.size >= 10000)
      return reply(
        {
          error:
            "Visual scan allowance reached. Wait for the hourly reset or choose your device manually.",
        },
        429,
      );
    try {
      const reader = request.body?.getReader();
      if (!reader) return reply({ error: "An image is required." }, 400);
      let size = 0;
      const chunks: Uint8Array[] = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1900000) {
          await reader.cancel();
          return reply(
            { error: "The image is too large. Choose a smaller photo." },
            413,
          );
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      entry.count++;
      hits.set(ip, entry);
      return reply(await identify(JSON.parse(new TextDecoder().decode(bytes))));
    } catch (error) {
      if (error instanceof ZodError || error instanceof SyntaxError)
        return reply(
          { error: "Choose a valid photo and confirm AI consent." },
          400,
        );
      return reply(
        {
          error:
            error instanceof Error && error.message === "VISION_NOT_CONFIGURED"
              ? "Visual AI is not configured. Choose a device manually or ask the owner to configure the free Google key."
              : "Visual AI could not complete this scan. The free quota may be exhausted. Retry later or choose your device manually.",
        },
        503,
      );
    }
  },
};
