import { it, expect, vi } from "vitest";
vi.mock("jose", () => ({ createRemoteJWKSet: vi.fn(), jwtVerify: vi.fn() }));
import { jwtVerify } from "jose";
import { authenticatedUser } from "../../api/sync";
it("requires an authenticated non-banned signed subject, rejecting anonymous service tokens", async () => {
  vi.stubEnv("NEON_AUTH_BASE_URL", "https://auth.example.com/neondb/auth");
  const request = new Request("https://reparo.example/api/sync", {
    headers: { Authorization: "Bearer fixture" },
  });
  for (const payload of [
    { sub: "shared-anonymous", role: "anonymous" },
    { sub: "user-a", role: "authenticated", banned: true },
    { role: "authenticated" },
  ]) {
    vi.mocked(jwtVerify).mockResolvedValue({ payload } as never);
    await expect(authenticatedUser(request)).rejects.toThrow("UNAUTHORIZED");
  }
  vi.mocked(jwtVerify).mockResolvedValue({
    payload: { sub: "user-a", role: "authenticated", banned: false },
  } as never);
  expect(await authenticatedUser(request)).toBe("user-a");
  vi.unstubAllEnvs();
});
