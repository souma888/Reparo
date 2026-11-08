import { analyze } from "../server/analyze.js";
import { requestSchema, rulesResult } from "../shared/analysis.js";
import { ZodError } from "zod";

// A bounded per-instance abuse guard. Configure a Vercel Firewall rate-limit
// rule for /api/analyze for distributed enforcement before broad public use.
const requests = new Map<string, { count: number; until: number }>();
export const maxDuration = 60;
export default {
  async fetch(request: Request): Promise<Response> {
    const reply = (body: unknown, status = 200) =>
      Response.json(body, {
        status,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    if (request.method !== "POST")
      return new Response(null, { status: 405, headers: { Allow: "POST" } });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      return reply({ error: "Cross-origin requests are not allowed." }, 403);
    if (!request.headers.get("content-type")?.includes("application/json"))
      return reply({ error: "Send a JSON request." }, 415);
    const key = request.headers.get("x-vercel-forwarded-for") || "local";
    const now = Date.now();
    for (const [ip, entry] of requests)
      if (entry.until < now) requests.delete(ip);
    const entry = requests.get(key) || { count: 0, until: now + 3600000 };
    const limited = entry.count >= 5 || requests.size >= 10000;
    entry.count++;
    requests.set(key, entry);
    try {
      // Enforce actual streamed byte size, not only a client-supplied header.
      const reader = request.body?.getReader();
      if (!reader) return reply({ error: "Request body is required." }, 400);
      let size = 0;
      const chunks: Uint8Array[] = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1900000) {
          await reader.cancel();
          return reply({ error: "Photo or request is too large." }, 413);
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      const input = requestSchema.parse(
        JSON.parse(new TextDecoder().decode(bytes)),
      );
      return reply(
        limited
          ? rulesResult(
              input,
              "This instance’s hourly AI allowance was reached. Basic guidance remains available; no paid fallback was used.",
            )
          : await analyze(input),
      );
    } catch (error) {
      if (error instanceof ZodError || error instanceof SyntaxError)
        return reply(
          {
            error: "Check the appliance, symptoms, safety answer, and consent.",
          },
          400,
        );
      // Do not log prompts, images, credentials, or raw provider error bodies.
      console.error("Reparo analysis failed", {
        type: error instanceof Error ? error.name : "unknown",
      });
      return reply(
        {
          error:
            "The guide is temporarily unavailable. Try basic guidance or download your observations. No paid fallback was used.",
        },
        503,
      );
    }
  },
};
