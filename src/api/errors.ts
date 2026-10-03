/**
 * Every failed request becomes an ApiError, so screens can switch on `code`
 * (e.g. SEAT_UNAVAILABLE) instead of parsing messages (REVIEW FD1).
 */
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

  /** Field errors from a 400 VALIDATION_ERROR, keyed by field path ("membership.fee"). */
  get fieldErrors(): Record<string, string> {
    if (this.code !== "VALIDATION_ERROR" || !Array.isArray(this.details)) return {};
    const out: Record<string, string> = {};
    for (const item of this.details as Array<{ path?: string; message?: string }>) {
      if (item.path && item.message && !out[item.path]) out[item.path] = item.message;
    }
    return out;
  }
}

/** The request never got an answer: no internet, server down, timeout. */
export const NETWORK_ERROR = "NETWORK_ERROR";

export function isApiError(error: unknown, code?: string): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

/**
 * An error the app itself raises with a message written for the user (e.g. "The card
 * was declined"). Plain `Error`s stay hidden behind a generic message, since their text
 * can be anything from a library.
 */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

/** A message that's safe to show the user for any error. */
export function errorMessage(error: unknown): string {
  if (error instanceof UserFacingError) return error.message;
  if (error instanceof ApiError) {
    if (error.code === NETWORK_ERROR) return "Can't reach the server. Check your internet and try again.";
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
