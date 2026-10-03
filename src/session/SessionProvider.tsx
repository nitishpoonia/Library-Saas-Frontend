import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { request } from "@/api/client";
import type { AuthTokens } from "@/api/types";
import { sessionStorage } from "./storage";
import { createTokenManager } from "./tokenManager";

type Status = "loading" | "signedOut" | "signedIn";

type SessionContextValue = {
  status: Status;
  signIn(tokens: AuthTokens): Promise<void>;
  signOut(options?: { deviceToken?: string }): Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("loading");

  const managerRef = useRef<ReturnType<typeof createTokenManager> | null>(null);
  if (!managerRef.current) {
    managerRef.current = createTokenManager(sessionStorage, () => {
      // The refresh token was rejected: back to sign-in, with nothing left in the cache.
      queryClient.clear();
      setStatus("signedOut");
    });
    managerRef.current.install();
  }
  const manager = managerRef.current;

  // On launch, turn the stored refresh token into a fresh access token.
  useEffect(() => {
    (async () => {
      const stored = await sessionStorage.getRefreshToken();
      if (!stored) return setStatus("signedOut");
      await manager.refresh();
      // Still stored means the refresh either worked or failed only for lack of internet.
      setStatus((await sessionStorage.getRefreshToken()) ? "signedIn" : "signedOut");
    })();
  }, [manager]);

  const signIn = useCallback(
    async (tokens: AuthTokens) => {
      queryClient.clear();
      await manager.start(tokens);
      setStatus("signedIn");
    },
    [manager, queryClient],
  );

  const signOut = useCallback(
    async (options?: { deviceToken?: string }) => {
      // Best effort: revoke this session on the server, then forget everything locally.
      try {
        await request("POST", "/auth/logout", { body: { deviceToken: options?.deviceToken } });
      } catch {
        // Offline or already expired: the local sign-out below still happens.
      }
      await manager.end();
      // Another owner may sign in on this phone next (REVIEW FS4).
      queryClient.clear();
      setStatus("signedOut");
    },
    [manager, queryClient],
  );

  const value = useMemo(() => ({ status, signIn, signOut }), [status, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
