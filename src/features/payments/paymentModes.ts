import type { PaymentMode } from "@/api/types";

export const PAYMENT_MODES: Array<{ value: PaymentMode; label: string }> = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
];

export const paymentModeLabel = (mode: PaymentMode) => PAYMENT_MODES.find((m) => m.value === mode)?.label ?? mode;
