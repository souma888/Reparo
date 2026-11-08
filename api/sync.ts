import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { dataSchema } from "../frontend/src/workshop-data.js";
const keysets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
export const maxDuration = 30;
export async function authenticatedUser(request: Request) {
  const base = process.env.NEON_AUTH_BASE_URL;
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (\S+)$/)?.[1];
  if (!base || !token) throw new Error("UNAUTHORIZED");
  const url = new URL(`${base.replace(/\/$/, "")}/.well-known/jwks.json`);
  let keys = keysets.get(url.href);
  if (!keys) {
    keys = createRemoteJWKSet(url);
    keysets.set(url.href, keys);
  }
  // Managed Auth tokens use the auth host as issuer and audience.
  const { payload } = await jwtVerify(token, keys, {
    issuer: new URL(base).origin,
    audience: new URL(base).origin,
    algorithms: ["EdDSA"],
    requiredClaims: ["sub", "exp", "iat"],
  });
  if (
    payload.role !== "authenticated" ||
    payload.banned === true ||
    !payload.sub ||
    payload.sub.length > 200
  )
    throw new Error("UNAUTHORIZED");
  return payload.sub;
}
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
    if (!["GET", "PUT"].includes(request.method))
      return new Response(null, {
        status: 405,
        headers: { Allow: "GET, PUT" },
      });
    if (
      request.headers.get("origin") &&
      request.headers.get("origin") !== new URL(request.url).origin
    )
      return reply({ error: "Cross-origin request rejected." }, 403);
    if (!process.env.DATABASE_URL || !process.env.NEON_AUTH_BASE_URL)
      return reply(
        {
          error: "Cloud sync is not configured. Your local data is unchanged.",
        },
        503,
      );
    let user: string;
    try {
      user = await authenticatedUser(request);
    } catch {
      return reply({ error: "Sign in to access your cloud copy." }, 401);
    }
    try {
      const sql = neon(process.env.DATABASE_URL);
      if (request.method === "GET") {
        const rows =
          await sql`SELECT data,revision,updated_at FROM public.reparo_workshops WHERE user_id=${user}`;
        return reply(rows[0] || { data: null, revision: 0 });
      }
      if (!request.headers.get("content-type")?.includes("application/json"))
        return reply({ error: "Send JSON." }, 415);
      const reader = request.body?.getReader();
      if (!reader) return reply({ error: "Body required." }, 400);
      let size = 0;
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 2097152) {
          await reader.cancel();
          return reply({ error: "Cloud backup exceeds 2 MB." }, 413);
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(new TextDecoder().decode(bytes));
      } catch {
        return reply({ error: "Invalid JSON." }, 400);
      }
      const body = parsed as { data?: unknown; revision?: unknown };
      const data = dataSchema.safeParse(body?.data);
      if (
        !data.success ||
        !Number.isSafeInteger(body?.revision) ||
        Number(body?.revision) < 0
      )
        return reply({ error: "Invalid workshop or revision." }, 400);
      const revision = Number(body.revision);
      const rows =
        revision === 0
          ? await sql`INSERT INTO public.reparo_workshops(user_id,data) VALUES(${user},${JSON.stringify(data.data)}::jsonb) ON CONFLICT(user_id) DO NOTHING RETURNING revision`
          : await sql`UPDATE public.reparo_workshops SET data=${JSON.stringify(data.data)}::jsonb,revision=revision+1,updated_at=now() WHERE user_id=${user} AND revision=${revision} RETURNING revision`;
      if (!rows.length)
        return reply(
          {
            error:
              "Cloud copy changed. Restore/merge the latest cloud copy before uploading.",
          },
          409,
        );
      return reply({ revision: rows[0].revision });
    } catch {
      return reply(
        { error: "Cloud sync unavailable. Your local records are preserved." },
        503,
      );
    }
  },
};
