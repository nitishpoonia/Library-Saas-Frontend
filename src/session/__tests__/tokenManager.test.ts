import { request } from "@/api/client";
import { createTokenManager, type TokenStorage } from "../tokenManager";

jest.mock("@/lib/env", () => ({ API_URL: "https://api.test/v1" }));

type FetchCall = { url: string; init: RequestInit };

function mockFetch(handler: (call: FetchCall) => { status: number; body?: unknown }) {
  const calls: FetchCall[] = [];
  globalThis.fetch = jest.fn(async (url: string, init: RequestInit) => {
    const call = { url, init };
    calls.push(call);
    const { status, body } = handler(call);
    return new Response(body === undefined ? null : JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
  return calls;
}

function memoryStorage(initial: string | null): TokenStorage & { value: string | null } {
  const store = {
    value: initial,
    getRefreshToken: async () => store.value,
    setRefreshToken: async (t: string) => {
      store.value = t;
    },
    clear: async () => {
      store.value = null;
    },
  };
  return store;
}

const authHeader = (call: FetchCall) => (call.init.headers as Record<string, string>).Authorization;

describe("token refresh", () => {
  it("refreshes once for many simultaneous 401s and retries each request", async () => {
    const storage = memoryStorage("refresh-1");
    const manager = createTokenManager(storage, jest.fn());
    manager.install();
    await manager.start({ accessToken: "expired", refreshToken: "refresh-1" });

    const calls = mockFetch(({ url, init }) => {
      if (url.endsWith("/auth/refresh")) {
        return { status: 200, body: { data: { accessToken: "fresh", refreshToken: "refresh-2", expiresIn: 900 } } };
      }
      const token = (init.headers as Record<string, string>).Authorization;
      return token === "Bearer fresh"
        ? { status: 200, body: { data: { ok: true } } }
        : { status: 401, body: { error: { code: "INVALID_TOKEN", message: "expired" } } };
    });

    const results = await Promise.all([1, 2, 3, 4, 5].map((n) => request("GET", `/thing/${n}`)));

    expect(results.every((r) => (r.data as { ok: boolean }).ok)).toBe(true);
    expect(calls.filter((c) => c.url.endsWith("/auth/refresh"))).toHaveLength(1);
    expect(storage.value).toBe("refresh-2");
    const retried = calls.filter((c) => c.url.includes("/thing/") && authHeader(c) === "Bearer fresh");
    expect(retried).toHaveLength(5);
  });

  it("signs out when the refresh token is rejected", async () => {
    const storage = memoryStorage("revoked");
    const onEnded = jest.fn();
    const manager = createTokenManager(storage, onEnded);
    manager.install();
    await manager.start({ accessToken: "expired", refreshToken: "revoked" });

    mockFetch(({ url }) =>
      url.endsWith("/auth/refresh")
        ? { status: 401, body: { error: { code: "SESSION_EXPIRED", message: "Session expired" } } }
        : { status: 401, body: { error: { code: "INVALID_TOKEN", message: "expired" } } },
    );

    await expect(request("GET", "/me")).rejects.toMatchObject({ status: 401 });
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(storage.value).toBeNull();
  });

  it("keeps the session when the phone is offline", async () => {
    const storage = memoryStorage("refresh-1");
    const onEnded = jest.fn();
    const manager = createTokenManager(storage, onEnded);
    manager.install();

    globalThis.fetch = jest.fn(async () => {
      throw new TypeError("Network request failed");
    }) as unknown as typeof fetch;

    expect(await manager.refresh()).toBe(false);
    expect(onEnded).not.toHaveBeenCalled();
    expect(storage.value).toBe("refresh-1");
  });
});

describe("request", () => {
  it("turns an API error body into an ApiError with field errors", async () => {
    mockFetch(() => ({
      status: 400,
      body: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details: [{ path: "membership.fee", message: "Fee can't be negative" }],
        },
      },
    }));
    const error = await request("POST", "/x", { body: {}, auth: false }).catch((e) => e);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.fieldErrors).toEqual({ "membership.fee": "Fee can't be negative" });
  });

  it("builds query strings and skips empty values", async () => {
    const calls = mockFetch(() => ({ status: 200, body: { data: [] } }));
    await request("GET", "/students", { query: { status: "overdue", search: "", page: 2, x: undefined }, auth: false });
    expect(calls[0]!.url).toBe("https://api.test/v1/students?status=overdue&page=2");
  });
});
