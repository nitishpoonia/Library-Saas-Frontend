import RazorpayCheckout from "react-native-razorpay";
import { UserFacingError } from "@/api/errors";
import type { BillingSummary } from "@/api/types";
import { billingApi, type OrderRequest } from "./api";

/** The owner closed Razorpay's checkout without paying. Not an error to show. */
export class CheckoutCancelled extends Error {}

/** Razorpay couldn't take the payment (declined, failed UPI, network). No money moved. */
export class CheckoutFailed extends UserFacingError {}

/**
 * Razorpay took the payment, but the app couldn't confirm it with the server.
 * The money is gone, so this must never read as "it didn't work": the webhook
 * finishes the job, and the billing screen waits for it.
 */
export class PaymentNotConfirmed extends Error {
  constructor(readonly subscriptionPaymentId: number) {
    super("Payment received but not confirmed yet");
  }
}

export type Prefill = { name?: string; contact?: string | null; email?: string | null };

type RazorpayErrorBody = { code?: string; description?: string; reason?: string };

/**
 * Makes sense of a rejection from `RazorpayCheckout.open`. The SDK rejects with
 * `{ code, description }` for every failure, cancellations included. The numeric code
 * isn't the same on Android and iOS, and `description` is sometimes plain text and
 * sometimes a JSON string `{ "error": { description, reason } }`. So cancellation is
 * recognised from `reason: "payment_cancelled"` or the word "cancel" in the text.
 */
export function readRazorpayError(rejection: unknown): { cancelled: boolean; message: string } {
  const raw = rejection as { description?: unknown; error?: RazorpayErrorBody } | null;

  let body: RazorpayErrorBody | undefined = raw?.error;
  let text = typeof raw?.description === "string" ? raw.description : "";
  if (!body && text.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(text) as { error?: RazorpayErrorBody };
      body = parsed.error;
    } catch {
      // Plain text after all.
    }
  }
  if (body?.description) text = body.description;

  const cancelled = body?.reason === "payment_cancelled" || /cancel/i.test(text);
  const message =
    text && !text.trim().startsWith("{") ? text : "The payment didn't go through. You can try again.";
  return { cancelled, message };
}

/**
 * Buy a plan or a branch add-on:
 *   1. the server creates a Razorpay order and works out the amount
 *   2. Razorpay Checkout collects the payment (UPI, card…)
 *   3. the server verifies Razorpay's signature and extends the subscription
 * If step 3 fails, the money has already been taken. Razorpay's webhook completes
 * step 3 instead, so that case is reported as PaymentNotConfirmed, not a failure.
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
  } catch (rejection) {
    const { cancelled, message } = readRazorpayError(rejection);
    if (cancelled) throw new CheckoutCancelled("Payment was not completed");
    throw new CheckoutFailed(message);
  }

  try {
    return await billingApi.verify({
      orderId: result.razorpay_order_id,
      paymentId: result.razorpay_payment_id,
      signature: result.razorpay_signature,
    });
  } catch {
    throw new PaymentNotConfirmed(order.subscriptionPaymentId);
  }
}
