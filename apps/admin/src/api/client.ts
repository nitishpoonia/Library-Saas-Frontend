import type { AdminProfile } from "./types";

/**
 * One way to call the backend. It adds the admin token, turns the backend's error
 * shape `{ error: { code, message, details } }` into an ApiError, and on a 401 ends the
 * session so the app goes back to the login screen.
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Session ────────────────────────────────────────────────────────────────

/** Kept in sessionStorage: it survives a reload but ends when the tab closes. */
export type Session = { token: string; expiresAt: string; admin: AdminProfile };

const SESSION_KEY = "library-saas-admin.session";
const listeners = new Set<() => void>();

// Used when sessionStorage is blocked: the session then lasts until the next reload.
let memoryRaw: string | null = null;
// The last parsed session. React's useSyncExternalStore compares snapshots with ===,
// so reading must return the SAME object until the stored value changes; a fresh
// JSON.parse on every read makes React re-render forever (error #185).
let cache: { raw: string | null; session: Session | null } = { raw: null, session: null };

function readRaw(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return memoryRaw;
  }
}

export function readSession(): Session | null {
  const raw = readRaw();
  if (raw !== cache.raw) {
    let session: Session | null = null;
    try {
      session = raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      session = null;
    }
    cache = { raw, session };
  }
  const session = cache.session;
  return session && new Date(session.expiresAt) > new Date() ? session : null;
}

export function saveSession(session: Session | null) {
  const raw = session ? JSON.stringify(session) : null;
  memoryRaw = raw;
  try {
    if (raw) sessionStorage.setItem(SESSION_KEY, raw);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage blocked: memoryRaw keeps it for this page load.
  }
  for (const listener of listeners) listener();
}

/** For useSyncExternalStore: re-render when someone logs in or out. */
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── Requests ───────────────────────────────────────────────────────────────

type Query = Record<string, string | number | boolean | undefined>;

export async function request<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; query?: Query; auth?: boolean } = {},
): Promise<T> {
  const url = new URL(`${API_URL}/admin/v1${path}`, window.location.origin);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const session = options.auth === false ? null : readSession();
  if (session) headers.Authorization = `Bearer ${session.token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Can't reach the server. Check your connection and the API address.");
  }

  if (res.status === 204) return undefined as T;
  const payload = (await res.json().catch(() => null)) as
    | { data?: unknown; meta?: unknown; error?: { code: string; message: string; details?: unknown } }
    | null;

  if (!res.ok) {
    // An expired or revoked session: back to the login screen.
    if (res.status === 401 && options.auth !== false) saveSession(null);
    const error = payload?.error;
    throw new ApiError(res.status, error?.code ?? "HTTP_ERROR", error?.message ?? `Request failed (${res.status})`, error?.details);
  }
  return payload as T;
}
