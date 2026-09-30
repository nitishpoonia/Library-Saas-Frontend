import { z } from "zod";

const money = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d+(\.\d{1,2})?$/.test(v), `${label} must be a number, up to 2 decimals`);

export const phone = z
  .string()
  .trim()
  .refine((v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")), "Enter a 10-digit mobile number");

export const name = z.string().trim().min(2, "At least 2 characters").max(100);

/** Period, time slot, fee and first payment: shared by "add student" and "renew". */
const periodFields = {
  startDate: z.string(),
  days: z.string().refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 366, "1 to 366 days"),
  startTime: z.string(),
  endTime: z.string(),
  fee: money("Fee").refine((v) => v !== "", "Enter the fee"),
  paidNow: money("Amount"),
  mode: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER"]),
};

const paidWithinFee = (v: { fee: string; paidNow: string }) => Number(v.paidNow || 0) <= Number(v.fee || 0);
const paidWithinFeeError = { message: "Can't be more than the fee", path: ["paidNow"] };

export const newStudentSchema = z
  .object({
    name,
    phone,
    ...periodFields,
    // Boolean(...) keeps TypeScript from narrowing the form value to a number.
    seatId: z.number().nullable().refine((v) => Boolean(v !== null), "Pick a free seat"),
  })
  .refine(paidWithinFee, paidWithinFeeError);

export const renewalSchema = z
  .object({
    ...periodFields,
    /** Change seat or time for the new period. Off keeps the current ones. */
    changeSeat: z.boolean(),
    seatId: z.number().nullable(),
  })
  .refine(paidWithinFee, paidWithinFeeError)
  .refine((v) => !v.changeSeat || v.seatId !== null, { message: "Pick a free seat", path: ["seatId"] });

export type NewStudentValues = z.infer<typeof newStudentSchema>;
export type RenewalValues = z.infer<typeof renewalSchema>;

/** "9876543210" / "+91 98765 43210" -> "9876543210" (the server adds +91). */
export const cleanPhone = (v: string) => v.replace(/[\s-]/g, "").replace(/^(\+?91|0)(?=[6-9]\d{9}$)/, "");
