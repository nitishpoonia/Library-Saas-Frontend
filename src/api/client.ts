import { API_URL } from "@/lib/env";
import { ApiError, NETWORK_ERROR } from "./errors";

/**
 * The one place the app talks to the backend.
 *
 * - Adds the access token to every request.
 * - When the backend says the token expired, asks the session to refresh it once
 *   and retries the request (REVIEW FA1). If the refresh fails, the session signs out.
 * - Turns every failure into an ApiError.
 */

export type ApiResponse<T> = { data: T; meta?: Record<string, unknown> };

type Query = Record<string, string | number | boolean | undefined | null>;

type RequestOptions = {
  query?: Query;
  body?: unknown;
  /** Send the access token. False only for login, signup and refresh. */
  auth?: boolean;
  signal?: AbortSignal;
};

/** Implemented by the session, which owns the tokens. */
export type AuthHandlers = {
  getAccessToken(): string | null;
  /** Refresh the access token. Resolves false if the session is over. */
  refresh(): Promise<boolean>;
};

let handlers: AuthHandlers = {
  getAccessToken: () => null,
  refresh: async () => false,
};

export function setAuthHandlers(next: AuthHandlers) {
  handlers = next;
}

const TIMEOUT_MS = 20_000;

function buildUrl(path: string, query?: Query) {
  const url = `${API_URL}${path}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `${url}?${params.join("&")}` : url;
}

async function send(method: string, path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const token = options.auth === false ? null : handlers.getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  options.signal?.addEventListener("abort", () => controller.abort());

  try {
    return await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR, "Network request failed");
  } finally {
    clearTimeout(timer);
  }
}

async function toError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as { error?: { code?: string; message?: string; details?: unknown } };
    if (body.error?.code) {
      return new ApiError(res.status, body.error.code, body.error.message ?? "Request failed", body.error.details);
    }
  } catch {
    // Not JSON (e.g. a proxy error page).
  }
  return new ApiError(res.status, `HTTP_${res.status}`, "Something went wrong. Please try again.");
}

export async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  let res = await send(method, path, options);

  if (res.status === 401 && options.auth !== false) {
    const refreshed = await handlers.refresh();
    if (refreshed) res = await send(method, path, options);
  }

  if (!res.ok) throw await toError(res);
  if (res.status === 204) return { data: undefined as T };
  return (await res.json()) as ApiResponse<T>;
}

/** Shortcuts that return just `data`. Use `request` when you also need `meta`. */
export const api = {
  get: async <T>(path: string, query?: Query) => (await request<T>("GET", path, { query })).data,
  post: async <T>(path: string, body?: unknown) => (await request<T>("POST", path, { body: body ?? {} })).data,
  patch: async <T>(path: string, body: unknown) => (await request<T>("PATCH", path, { body })).data,
  delete: async (path: string) => {
    await request<void>("DELETE", path);
  },
};
