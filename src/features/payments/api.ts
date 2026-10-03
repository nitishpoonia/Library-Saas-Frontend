import { api } from "@/api/client";
import type { Payment, Receipt } from "@/api/types";
import type { PaymentInput } from "../students/api";

export const paymentsApi = {
  record: (libraryId: number, membershipId: number, input: PaymentInput) =>
    api.post<Receipt>(`/libraries/${libraryId}/memberships/${membershipId}/payments`, input),
  receipt: (libraryId: number, paymentId: number) =>
    api.get<Receipt>(`/libraries/${libraryId}/payments/${paymentId}/receipt`),
  void: (libraryId: number, paymentId: number, reason: string) =>
    api.post<Payment>(`/libraries/${libraryId}/payments/${paymentId}/void`, { reason }),
};
