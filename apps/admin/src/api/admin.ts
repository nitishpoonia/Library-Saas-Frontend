import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request, saveSession } from "./client";
import type {
  AuditEntry,
  JobRun,
  LoginResult,
  Notice,
  Order,
  OrganizationDetail,
  OrganizationRow,
  Overview,
  Page,
  SubscriptionStatus,
} from "./types";

/** Every admin API call, as React Query hooks. Pages never call fetch directly. */

type Data<T> = { data: T };

export async function login(input: { email: string; password: string; code: string }) {
  const { data } = await request<Data<LoginResult>>("/auth/login", { method: "POST", body: input, auth: false });
  saveSession(data);
  return data;
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    saveSession(null);
  }
}

export const useOverview = () =>
  useQuery({
    queryKey: ["overview"],
    queryFn: () => request<Data<Overview>>("/overview").then((r) => r.data),
  });

export type OrganizationFilters = {
  page: number;
  search?: string;
  status?: SubscriptionStatus;
  suspended?: "true" | "false";
};

export const useOrganizations = (filters: OrganizationFilters) =>
  useQuery({
    queryKey: ["organizations", filters],
    queryFn: () => request<Page<OrganizationRow>>("/organizations", { query: { ...filters, limit: 25 } }),
    placeholderData: keepPreviousData,
  });

export const useOrganization = (id: number) =>
  useQuery({
    queryKey: ["organization", id],
    queryFn: () => request<Data<OrganizationDetail>>(`/organizations/${id}`).then((r) => r.data),
  });

export type OrganizationAction = "extend-trial" | "suspend" | "unsuspend" | "revoke-sessions";

/** Runs an action on an account, then refreshes everything that shows it. */
export function useOrganizationAction(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ action, body }: { action: OrganizationAction; body: { reason: string; days?: number } }) =>
      request(`/organizations/${id}/${action}`, { method: "POST", body }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["organization", id] }),
        client.invalidateQueries({ queryKey: ["organizations"] }),
        client.invalidateQueries({ queryKey: ["overview"] }),
        client.invalidateQueries({ queryKey: ["audit"] }),
      ]);
    },
  });
}

export const useOrders = (filters: { page: number; status?: "CREATED" | "PAID" }) =>
  useQuery({
    queryKey: ["orders", filters],
    queryFn: () => request<Page<Order>>("/billing/orders", { query: { ...filters, limit: 25 } }),
    placeholderData: keepPreviousData,
  });

export const useJobRuns = () =>
  useQuery({
    queryKey: ["job-runs"],
    queryFn: () => request<Data<JobRun[]>>("/ops/job-runs").then((r) => r.data),
  });

export const useNotices = (filters: { page: number; status: "FAILED" | "SKIPPED" | "SENT" }) =>
  useQuery({
    queryKey: ["notices", filters],
    queryFn: () => request<Page<Notice>>("/ops/notifications", { query: { ...filters, limit: 25 } }),
    placeholderData: keepPreviousData,
  });

export const useAuditLog = (filters: { page: number; targetType?: string; targetId?: number }) =>
  useQuery({
    queryKey: ["audit", filters],
    queryFn: () => request<Page<AuditEntry>>("/audit-log", { query: { ...filters, limit: 25 } }),
    placeholderData: keepPreviousData,
  });
