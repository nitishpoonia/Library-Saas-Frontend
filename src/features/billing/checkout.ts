import RazorpayCheckout from "react-native-razorpay";
import type { BillingSummary } from "@/api/types";
import { billingApi, type OrderRequest } from "./api";

/** Thrown when the owner closes Razorpay's checkout without paying. Not an error to show. */
export class CheckoutCancelled extends Error {}

export type Prefill = { name?: string; contact?: string | null; email?: string | null };

/**
 * Buy a plan or a branch add-on:
 *   1. the server creates a Razorpay order and works out the amount
 *   2. Razorpay Checkout collects the payment (UPI, card…)
 *   3. the server verifies Razorpay's signature and extends the subscription
 * If the app closes between 2 and 3, Razorpay's webhook completes step 3 instead.
 */
export async function checkout(request: OrderRequest, prefill: Prefill, color: string): Promise<BillingSummary> {
  const order = await billingApi.order(request);

  let result;
  try {
    result = await RazorpayCheckout.open({
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency,
      order_id: order.orderId,
      name: "LibrarySaaS",
      description: request.kind === "PLAN" ? `${request.plan.toLowerCase()} plan` : "Extra branch",
      prefill: { name: prefill.name, contact: prefill.contact ?? undefined, email: prefill.email ?? undefined },
      theme: { color },
    });
  } catch {
    throw new CheckoutCancelled("Payment was not completed");
  }

  return billingApi.verify({
    orderId: result.razorpay_order_id,
    paymentId: result.razorpay_payment_id,
    signature: result.razorpay_signature,
  });
}
