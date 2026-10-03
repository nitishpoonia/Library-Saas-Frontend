import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { accountApi } from "@/features/account/api";
import { AuthShell } from "@/features/auth/AuthShell";
import { signUpSchema, type SignUpValues } from "@/features/auth/schemas";
import { applyServerErrors } from "@/features/auth/useServerErrors";
import { useSession } from "@/session/SessionProvider";
import { Button, ErrorBanner, FormTextField, Text, colors, spacing } from "@/ui";

export default function SignUpScreen() {
  const { signIn } = useSession();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", identifier: "", password: "" },
  });

  const signup = useMutation({
    mutationFn: accountApi.signup,
    onSuccess: signIn,
    onError: (error) => applyServerErrors(error, form.setError, ["name", "identifier", "password"]),
  });

  const onSubmit = form.handleSubmit((values) => signup.mutate(values));

  return (
    <AuthShell title="Create your account" subtitle="14 days free. No card needed.">
      <FormTextField control={form.control} name="name" label="Your name" autoComplete="name" returnKeyType="next" />
      <FormTextField
        control={form.control}
        name="identifier"
        label="Email or mobile number"
        autoCapitalize="none"
        autoComplete="username"
        keyboardType="email-address"
        returnKeyType="next"
      />
      <FormTextField
        control={form.control}
        name="password"
        label="Password"
        hint="At least 8 characters"
        secureTextEntry
        autoComplete="new-password"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />
      <ErrorBanner error={signup.error && !Object.keys(form.formState.errors).length ? signup.error : null} />
      <Button title="Create account" onPress={onSubmit} loading={signup.isPending} />
      <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing.xs }}>
        <Text variant="body" color={colors.textMuted}>
          Already have an account?
        </Text>
        <Link href="/sign-in" replace>
          <Text variant="bodyStrong" color={colors.primary}>
            Sign in
          </Text>
        </Link>
      </View>
    </AuthShell>
  );
}
