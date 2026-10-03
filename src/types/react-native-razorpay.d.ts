// react-native-razorpay ships JavaScript without type declarations.
declare module "react-native-razorpay" {
  export type CheckoutOptions = {
    key: string;
    amount: number;
    currency?: string;
    name?: string;
    description?: string;
    order_id: string;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color?: string };
  };
  export type CheckoutSuccess = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };
  const RazorpayCheckout: { open(options: CheckoutOptions): Promise<CheckoutSuccess> };
  export default RazorpayCheckout;
}
