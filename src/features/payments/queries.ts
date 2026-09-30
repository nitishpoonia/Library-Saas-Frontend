import { useMutation, useQuery } from "@tanstack/react-query";
import { keys } from "@/api/keys";
import type { PaymentInput } from "../students/api";
import { useRefreshBranch } from "../students/queries";
import { paymentsApi } from "./api";

export function useReceipt(libraryId: number, paymentId: number) {
  return useQuery({
    queryKey: keys.receipt(libraryId, paymentId),
    queryFn: () => paymentsApi.receipt(libraryId, paymentId),
  });
}

export function useRecordPayment(libraryId: number, membershipId: number) {
  const refresh = useRefreshBranch(libraryId);
  return useMutation({
    mutationFn: (input: PaymentInput) => paymentsApi.record(libraryId, membershipId, input),
    onSuccess: refresh,
  });
}

export function useVoidPayment(libraryId: number, paymentId: number) {
  const refresh = useRefreshBranch(libraryId);
  return useMutation({
    mutationFn: (reason: string) => paymentsApi.void(libraryId, paymentId, reason),
    onSuccess: refresh,
  });
}
