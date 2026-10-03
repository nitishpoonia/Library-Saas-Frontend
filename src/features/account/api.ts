import { api, request } from "@/api/client";
import type { AuthTokens, Me } from "@/api/types";

export const accountApi = {
  signup: async (input: { name: string; identifier: string; password: string }) =>
    (await request<AuthTokens>("POST", "/auth/signup", { body: input, auth: false })).data,

  login: async (input: { identifier: string; password: string }) =>
    (await request<AuthTokens>("POST", "/auth/login", { body: input, auth: false })).data,

  me: () => api.get<Me>("/me"),
};
