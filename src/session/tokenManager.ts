import { request, setAuthHandlers } from "@/api/client";
import { isApiError, NETWORK_ERROR } from "@/api/errors";
import type { AuthTokens } from "@/api/types";

/**
 * Holds the tokens and refreshes them. Kept outside React so the HTTP client can
 * use it, and so it can be unit tested.
 *
 * Refresh is single-flight: if five requests fail with 401 at the same moment, only
 * one refresh call goes out and all five wait for it. Without this, the backend's
 * refresh-token rotation would reject the second to fifth calls and log the user out.
 */
export type TokenStorage = {
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  clear(): Promise<void>;
};

export function createTokenManager(storage: TokenStorage, onSessionEnded: () => void) {
  let accessToken: string | null = null;
  let inFlight: Promise<boolean> | null = null;

  type Outcome = "ok" | "expired" | "offline";

  async function doRefresh(): Promise<Outcome> {
    const refreshToken = await storage.getRefreshToken();
    if (!refreshToken) return "expired";
    try {
      const { data } = await request<Omit<AuthTokens, "userId">>("POST", "/auth/refresh", {
        body: { refreshToken },
        auth: false,
      });
      accessToken = data.accessToken;
      await storage.setRefreshToken(data.refreshToken);
      return "ok";
    } catch (error) {
      // No internet isn't a logout: keep the session and let the request fail with a
      // network error the screen can retry.
      if (isApiError(error, NETWORK_ERROR) || (isApiError(error) && error.status >= 500)) {
        return "offline";
      }
      return "expired";
    }
  }

  const manager = {
    getAccessToken: () => accessToken,

    refresh(): Promise<boolean> {
      if (!inFlight) {
        inFlight = doRefresh()
          .then(async (outcome) => {
            if (outcome === "expired") {
              accessToken = null;
              await storage.clear();
              onSessionEnded();
            }
            return outcome === "ok";
          })
          .finally(() => {
            inFlight = null;
          });
      }
      return inFlight;
    },

    async start(tokens: Pick<AuthTokens, "accessToken" | "refreshToken">) {
      accessToken = tokens.accessToken;
      await storage.setRefreshToken(tokens.refreshToken);
    },

    async end() {
      accessToken = null;
      await storage.clear();
    },

    /** Connects this manager to the HTTP client. */
    install() {
      setAuthHandlers({ getAccessToken: manager.getAccessToken, refresh: manager.refresh });
    },
  };

  return manager;
}

export type TokenManager = ReturnType<typeof createTokenManager>;
