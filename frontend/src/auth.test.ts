import { it, expect, vi } from "vitest";
vi.mock("@neon/auth", () => ({
  createAuthClient: () => ({ getSession: vi.fn() }),
}));
vi.mock("@neon/auth/react/adapters", () => ({
  BetterAuthReactAdapter: vi.fn(),
}));
import { auth, bearer } from "./auth";
it("reads the installed SDK's JWT-injected session and rejects opaque/missing tokens", async () => {
  vi.mocked(auth.getSession).mockResolvedValue({
    data: { session: { token: "header.claims.signature" } },
    error: null,
  } as never);
  expect(await bearer()).toBe("header.claims.signature");
  vi.mocked(auth.getSession).mockResolvedValue({
    data: { session: { token: "opaque-session" } },
    error: null,
  } as never);
  await expect(bearer()).rejects.toThrow("sign in");
  vi.mocked(auth.getSession).mockResolvedValue({
    data: null,
    error: { message: "signed out" },
  } as never);
  await expect(bearer()).rejects.toThrow("sign in");
});
