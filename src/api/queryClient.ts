import { QueryClient } from "@tanstack/react-query";
import { ApiError, NETWORK_ERROR } from "./errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retry network blips, never a 4xx: a 404 or 403 won't fix itself.
      retry: (failureCount, error) =>
        failureCount < 2 &&
        (!(error instanceof ApiError) || error.code === NETWORK_ERROR || error.status >= 500),
    },
    mutations: { retry: false },
  },
});
