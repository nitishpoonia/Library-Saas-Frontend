import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, readSession, request, saveSession } from "./client";

const session = {
  token: "t0k3n",
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  admin: { id: 1, email: "ops@example.com", name: "Ops" },
};

function reply(status: number, body: unknown) {
  return vi.fn().mockResolvedValue(new Response(body === undefined ? null : JSON.stringify(body), { status }));
}

beforeEach(() => saveSession(session));
afterEach(() => {
  vi.unstubAllGlobals();
  saveSession(null);
});

describe("API client", () => {
  it("sends the admin token and returns the body", async () => {
    const fetch = reply(200, { data: { ok: true } });
    vi.stubGlobal("fetch", fetch);
    expect(await request("/overview")).toEqual({ data: { ok: true } });
    const [url, init] = fetch.mock.calls[0]!;
    expect(String(url)).toContain("/admin/v1/overview");
    expect(init.headers.Authorization).toBe("Bearer t0k3n");
  });

  it("turns the backend's error shape into an ApiError", async () => {
    vi.stubGlobal("fetch", reply(409, { error: { code: "ALREADY_SUSPENDED", message: "This account is already suspended" } }));
    await expect(request("/organizations/1/suspend", { method: "POST", body: { reason: "x" } })).rejects.toMatchObject({
      status: 409,
      code: "ALREADY_SUSPENDED",
      message: "This account is already suspended",
    });
    expect(readSession()).not.toBeNull();
  });

  it("ends the session on a 401", async () => {
    vi.stubGlobal("fetch", reply(401, { error: { code: "SESSION_EXPIRED", message: "Session ended" } }));
    await expect(request("/me")).rejects.toBeInstanceOf(ApiError);
    expect(readSession()).toBeNull();
  });

  it("keeps the session when a login attempt is refused", async () => {
    vi.stubGlobal("fetch", reply(401, { error: { code: "INVALID_CREDENTIALS", message: "No" } }));
    await expect(request("/auth/login", { method: "POST", body: {}, auth: false })).rejects.toBeInstanceOf(ApiError);
    expect(readSession()).not.toBeNull();
  });

  it("explains a network failure instead of throwing a raw TypeError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(request("/overview")).rejects.toMatchObject({ code: "NETWORK" });
  });

  it("returns the same session object until it changes (React needs a stable snapshot)", () => {
    const first = readSession();
    expect(readSession()).toBe(first);
    saveSession({ ...session, token: "other" });
    expect(readSession()).not.toBe(first);
    expect(readSession()?.token).toBe("other");
  });

  it("treats an expired session as logged out", () => {
    saveSession({ ...session, expiresAt: new Date(Date.now() - 1000).toISOString() });
    expect(readSession()).toBeNull();
  });
});
