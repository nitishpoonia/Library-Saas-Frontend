import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { accountApi } from "@/features/account/api";
import { AuthShell, AuthSwitch } from "@/features/auth/AuthShell";
import { signInSchema, type SignInValues } from "@/features/auth/schemas";
import { applyServerErrors } from "@/features/auth/useServerErrors";
import { useSession } from "@/session/SessionProvider";
import { Button, ErrorBanner, FormTextField } from "@/ui";

export default function SignInScreen() {
  const { signIn } = useSession();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const login = useMutation({
    mutationFn: accountApi.login,
    onSuccess: signIn,
    onError: (error) => applyServerErrors(error, form.setError, ["identifier", "password"]),
  });

  const onSubmit = form.handleSubmit((values) => login.mutate(values));

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your library">
      <FormTextField
        control={form.control}
        name="identifier"
        label="Email or mobile number"
        placeholder="98765 43210"
        autoCapitalize="none"
        autoComplete="username"
        keyboardType="email-address"
        returnKeyType="next"
      />
      <FormTextField
        control={form.control}
        name="password"
        label="Password"
        secureTextEntry
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />
      <ErrorBanner error={login.error && !Object.keys(form.formState.errors).length ? login.error : null} />
      <Button title="Sign in" onPress={onSubmit} loading={login.isPending} />
      <AuthSwitch prompt="New here?" action="Create an account" href="/sign-up" />
    </AuthShell>
  );
}
