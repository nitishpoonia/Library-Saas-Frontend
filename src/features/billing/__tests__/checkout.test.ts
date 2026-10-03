import { errorMessage } from "@/api/errors";
import { CheckoutCancelled, CheckoutFailed, PaymentNotConfirmed, checkout, readRazorpayError } from "../checkout";

jest.mock("@/lib/env", () => ({ API_URL: "https://api.test/v1" }));

const mockOpen = jest.fn();
jest.mock("react-native-razorpay", () => ({ __esModule: true, default: { open: (...args: unknown[]) => mockOpen(...args) } }));

type Call = { url: string; body: unknown };

function mockServer() {
  const calls: Call[] = [];
  globalThis.fetch = jest.fn(async (url: string, init: RequestInit) => {
    const body = init.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url, body });
    if (url.endsWith("/billing/orders")) {
      return new Response(JSON.stringify({ data: { subscriptionPaymentId: 1, orderId: "order_1", amountPaise: 999000, currency: "INR", keyId: "rzp_test" } }), { status: 201 });
    }
    return new Response(JSON.stringify({ data: { status: "ACTIVE" } }), { status: 200 });
  }) as unknown as typeof fetch;
  return calls;
}

describe("checkout", () => {
  beforeEach(() => mockOpen.mockReset());

  it("opens Razorpay with the server's order and verifies the result", async () => {
    const calls = mockServer();
    mockOpen.mockResolvedValue({ razorpay_order_id: "order_1", razorpay_payment_id: "pay_1", razorpay_signature: "sig" });

    const summary = await checkout({ kind: "PLAN", plan: "YEARLY" }, { name: "Asha", contact: "+919876543210" }, "#3B82F6");

    expect(calls[0]).toEqual({ url: "https://api.test/v1/billing/orders", body: { kind: "PLAN", plan: "YEARLY" } });
    // The amount comes from the server's order, never from the app.
    expect(mockOpen).toHaveBeenCalledWith(expect.objectContaining({ key: "rzp_test", amount: 999000, order_id: "order_1" }));
    expect(calls[1]).toEqual({
      url: "https://api.test/v1/billing/verify",
      body: { orderId: "order_1", paymentId: "pay_1", signature: "sig" },
    });
    expect(summary).toEqual({ status: "ACTIVE" });
  });

  it("reports a closed checkout as cancelled and doesn't verify", async () => {
    const calls = mockServer();
    mockOpen.mockRejectedValue({ code: 0, description: "Payment cancelled by user" });

    await expect(checkout({ kind: "BRANCH_ADDON" }, {}, "#000")).rejects.toBeInstanceOf(CheckoutCancelled);
    expect(calls.map((c) => c.url)).toEqual(["https://api.test/v1/billing/orders"]);
  });

  it("reads a cancellation sent as a JSON description", async () => {
    mockServer();
    mockOpen.mockRejectedValue({
      code: 2,
      description: JSON.stringify({ error: { description: "Payment processing cancelled by user", reason: "payment_cancelled" } }),
    });

    await expect(checkout({ kind: "BRANCH_ADDON" }, {}, "#000")).rejects.toBeInstanceOf(CheckoutCancelled);
  });

  it("shows a real failure instead of hiding it as a cancellation", async () => {
    const calls = mockServer();
    mockOpen.mockRejectedValue({
      code: 1,
      description: JSON.stringify({ error: { description: "Your payment has been declined by the bank", reason: "payment_failed" } }),
    });

    const error = await checkout({ kind: "PLAN", plan: "MONTHLY" }, {}, "#000").catch((e) => e);
    expect(error).toBeInstanceOf(CheckoutFailed);
    expect(errorMessage(error)).toBe("Your payment has been declined by the bank");
    expect(calls.map((c) => c.url)).toEqual(["https://api.test/v1/billing/orders"]);
  });

  it("never reports a taken payment as failed when verify fails", async () => {
    globalThis.fetch = jest.fn(async (url: string) =>
      url.endsWith("/billing/orders")
        ? new Response(JSON.stringify({ data: { subscriptionPaymentId: 7, orderId: "order_7", amountPaise: 99900, currency: "INR", keyId: "rzp_test" } }), { status: 201 })
        : new Response(JSON.stringify({ error: { code: "INTERNAL", message: "boom" } }), { status: 502 }),
    ) as unknown as typeof fetch;
    mockOpen.mockResolvedValue({ razorpay_order_id: "order_7", razorpay_payment_id: "pay_7", razorpay_signature: "sig" });

    const error = await checkout({ kind: "PLAN", plan: "MONTHLY" }, {}, "#000").catch((e) => e);
    expect(error).toBeInstanceOf(PaymentNotConfirmed);
    expect(error.subscriptionPaymentId).toBe(7);
  });
});

describe("readRazorpayError", () => {
  it("handles plain text and missing descriptions", () => {
    expect(readRazorpayError({ code: 0, description: "Payment cancelled by user" })).toEqual({
      cancelled: true,
      message: "Payment cancelled by user",
    });
    expect(readRazorpayError({ code: 100 })).toEqual({
      cancelled: false,
      message: "The payment didn't go through. You can try again.",
    });
    expect(readRazorpayError(null).cancelled).toBe(false);
  });
});
