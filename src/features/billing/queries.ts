import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/api/keys";
import { brandColor } from "@/ui";
import { billingApi, type OrderRequest } from "./api";
import { checkout, type Prefill } from "./checkout";

export { CheckoutCancelled } from "./checkout";

export function useBilling() {
  return useQuery({ queryKey: keys.billing, queryFn: billingApi.summary });
}

export function useCheckout(prefill: Prefill) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: OrderRequest) => checkout(request, prefill, brandColor),
    onSuccess: async (summary) => {
      queryClient.setQueryData(keys.billing, summary);
      // Subscription state shows on every branch's dashboard.
      await queryClient.invalidateQueries({ queryKey: ["library"] });
      await queryClient.invalidateQueries({ queryKey: keys.me });
    },
  });
}
