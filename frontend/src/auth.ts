import { createAuthClient } from "@neon/auth";
import { BetterAuthReactAdapter } from "@neon/auth/react/adapters";
export const authConfigured = Boolean(import.meta.env.VITE_NEON_AUTH_URL);
export const auth = createAuthClient(
  import.meta.env.VITE_NEON_AUTH_URL || "https://unconfigured.invalid/auth",
  { adapter: BetterAuthReactAdapter() },
);
export async function bearer() {
  const { data, error } = await auth.$fetch<{ token: string }>("/token");
  if (error || !data?.token) throw new Error("Please sign in again.");
  return data.token;
}
