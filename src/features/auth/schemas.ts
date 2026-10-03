import { z } from "zod";

/** Email, or an Indian mobile number with or without +91. The server does the final check. */
export const identifier = z
  .string()
  .trim()
  .min(1, "Enter your email or mobile number")
  .refine(
    (v) => (v.includes("@") ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : /^(?:\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ""))),
    "Enter a valid email or 10-digit mobile number",
  );

export const password = z.string().min(8, "At least 8 characters").max(72, "At most 72 characters");

export const signInSchema = z.object({
  identifier,
  password: z.string().min(1, "Enter your password"),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
  identifier,
  password,
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
