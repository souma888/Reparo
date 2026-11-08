import { claimModelAttempt } from "../server/rate-limit.js";
import { aiAvailable } from "../server/model.js";
import { analyze, streamAnalysis } from "../server/analyze.js";
import { requestSchema, rulesResult, mustStop } from "../shared/analysis.js";
import { ZodError } from "zod";

// Bounded per-instance provider budget, supplemented by the project’s
// regional Vercel Firewall API ingress rule. Basic/safety requests bypass it.
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
      const key = request.headers.get("x-vercel-forwarded-for") || "local";
      const now = Date.now();
      for (const [ip, entry] of requests)
        if (entry.until < now) requests.delete(ip);
      const entry = requests.get(key) || { count: 0, until: now + 3600000 };
      let limited = entry.count >= 5 || requests.size >= 10000;
      if (input.mode !== "ai" || mustStop(input) || !aiAvailable())
        return reply(await analyze(input));
      if (!limited) limited = !(await claimModelAttempt(key, "analysis"));
      if (!limited) {
        entry.count++;
        requests.set(key, entry);
      }
      if (
        !limited &&
        request.headers.get("accept")?.includes("application/x-ndjson")
      )
        return streamAnalysis(input);
      return reply(
        limited
          ? rulesResult(
              input,
              "The shared AI allowance was reached or its quota check is unavailable. Basic guidance remains available; no paid fallback was used.",
            )
          : await analyze(input),
      );
    } catch (error) {
      if (
        error instanceof ZodError ||
        (error instanceof Error && error.name === "$ZodError") ||
        error instanceof SyntaxError
      )
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
