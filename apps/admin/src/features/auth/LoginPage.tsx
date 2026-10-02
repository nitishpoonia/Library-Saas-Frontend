import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { login } from "../../api/admin";
import { ApiError } from "../../api/client";
import { useSession } from "../../components/AppShell";
import { Button, Field, Input } from "../../components/ui";

const schema = z.object({
  email: z.string().trim().email("Enter your admin email"),
  password: z.string().min(1, "Enter your password"),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app"),
});
type Values = z.infer<typeof schema>;

export function LoginPage() {
  const session = useSession();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/";
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  if (session) return <Navigate to={from} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      // A code works once; clear it so the next try uses a fresh one.
      resetField("code");
      setServerError(
        err instanceof ApiError && err.code === "RATE_LIMITED"
          ? err.message
          : err instanceof ApiError && err.status === 401
            ? "That email, password or code didn't match. Codes change every 30 seconds; use the current one."
            : err instanceof ApiError
              ? err.message
              : "Couldn't log in. Try again.",
      );
    }
  });

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={onSubmit} noValidate className="w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-2xl">Library SaaS admin</h1>
          <p className="mt-1 text-sm text-quiet">For the team running the service. Library owners use the app.</p>
        </div>

        {serverError && (
          <p className="rounded-md bg-critical-soft px-3 py-2 text-sm text-critical" role="alert">
            {serverError}
          </p>
        )}

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="username" autoFocus aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>
        <Field
          label="Authenticator code"
          htmlFor="code"
          error={errors.code?.message}
          hint="The 6 digits in your authenticator app"
        >
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="font-mono tracking-[0.3em]"
            aria-invalid={!!errors.code}
            {...register("code")}
          />
        </Field>

        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </main>
  );
}
