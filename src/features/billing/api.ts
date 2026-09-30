import { api } from "@/api/client";
import type { BillingOrder, BillingPlan, BillingSummary } from "@/api/types";

export type OrderRequest = { kind: "PLAN"; plan: BillingPlan } | { kind: "BRANCH_ADDON" };

export const billingApi = {
  summary: () => api.get<BillingSummary>("/billing"),
  order: (input: OrderRequest) => api.post<BillingOrder>("/billing/orders", input),
  verify: (input: { orderId: string; paymentId: string; signature: string }) =>
    api.post<BillingSummary>("/billing/verify", input),
};
