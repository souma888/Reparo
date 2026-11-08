import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
// Atomic shared budget across function instances. No raw IPs or evidence stored.
export async function claimModelAttempt(
  ip: string,
  kind: "analysis" | "vision",
) {
  if (!process.env.DATABASE_URL) return true; // Local development retains the bounded in-memory guard.
  const pepper = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!pepper) return false;
  const bucket = `${kind}:${createHash("sha256").update(`${pepper}:${ip}`).digest("hex")}`;
  const limit = kind === "analysis" ? 5 : 20;
  try {
    const sql = neon(process.env.DATABASE_URL);
    // Expiry affects abuse-budget rows only, never workshop/account records.
    await sql`DELETE FROM public.reparo_ai_budget WHERE window_start < date_trunc('hour',now()) - interval '2 hours'`;
    const rows =
      await sql`INSERT INTO public.reparo_ai_budget(bucket,window_start,attempts) VALUES(${bucket},date_trunc('hour',now()),1) ON CONFLICT(bucket,window_start) DO UPDATE SET attempts=reparo_ai_budget.attempts+1 WHERE reparo_ai_budget.attempts < ${limit} RETURNING attempts`;
    return rows.length > 0;
  } catch {
    return false;
  } // A free database outage must not enable unmetered inference.
}
