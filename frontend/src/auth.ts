import { createAuthClient } from "@neon/auth";
import { BetterAuthReactAdapter } from "@neon/auth/react/adapters";
export const authConfigured = Boolean(import.meta.env.VITE_NEON_AUTH_URL);
export const auth = createAuthClient(
  import.meta.env.VITE_NEON_AUTH_URL || "https://unconfigured.invalid/auth",
  { adapter: BetterAuthReactAdapter() },
);
export async function bearer() {
  // @neon/auth 0.8.2 injects the signed JWT from its response header into
  // session.token. Its own adapter's getJWTToken() uses this same method.
  const { data, error } = await auth.getSession();
  const token = data?.session?.token;
  if (error || !token || token.split(".").length !== 3)
    throw new Error("Please sign in again.");
  return token; // Signature, issuer, audience and expiry are verified on the API.
}
