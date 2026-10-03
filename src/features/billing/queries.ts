import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/api/keys";
import { colors } from "@/ui";
import { billingApi, type OrderRequest } from "./api";
import { checkout, type Prefill } from "./checkout";

export { CheckoutCancelled, CheckoutFailed, PaymentNotConfirmed } from "./checkout";

/** @param pollMs Refetch on this interval, e.g. while waiting for a payment to be confirmed. */
export function useBilling(pollMs?: number) {
  return useQuery({ queryKey: keys.billing, queryFn: billingApi.summary, refetchInterval: pollMs ?? false });
}

export function useCheckout(prefill: Prefill) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: OrderRequest) => checkout(request, prefill, colors.primary),
    onSuccess: (summary) => {
      queryClient.setQueryData(keys.billing, summary);
      refreshAfterPayment(queryClient);
    },
  });
}

/** Subscription state shows on every branch's dashboard and in /me. */
export function refreshAfterPayment(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["library"] });
  void queryClient.invalidateQueries({ queryKey: keys.me });
}
