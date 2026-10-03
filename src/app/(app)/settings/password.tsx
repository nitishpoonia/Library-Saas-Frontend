import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import { z } from "zod";
import { isApiError } from "@/api/errors";
import { useChangePassword } from "@/features/account/mutations";
import { password } from "@/features/auth/schemas";
import { Button, ErrorBanner, FormTextField, Screen, Text } from "@/ui";

const schema = z
  .object({ currentPassword: z.string().min(1, "Enter your current password"), newPassword: password, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { message: "Passwords don't match", path: ["confirm"] })
  .refine((v) => v.newPassword !== v.currentPassword, { message: "Use a different password", path: ["newPassword"] });
type Values = z.infer<typeof schema>;

export default function PasswordScreen() {
  const change = useChangePassword();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { currentPassword: "", newPassword: "", confirm: "" } });

  const onSubmit = form.handleSubmit((v) =>
    change.mutate(
      { currentPassword: v.currentPassword, newPassword: v.newPassword },
      {
        onSuccess: () => {
          Alert.alert("Password changed", "Other phones signed in to this account have been signed out.");
          router.back();
        },
        onError: (error) => {
          if (isApiError(error, "WRONG_PASSWORD")) form.setError("currentPassword", { message: "That's not your current password" });
        },
      },
    ),
  );

  return (
    <Screen form footer={<Button title="Change password" onPress={onSubmit} loading={change.isPending} />}>
      <FormTextField control={form.control} name="currentPassword" label="Current password" secureTextEntry autoComplete="current-password" />
      <FormTextField control={form.control} name="newPassword" label="New password" hint="At least 8 characters" secureTextEntry autoComplete="new-password" />
      <FormTextField control={form.control} name="confirm" label="Type it again" secureTextEntry autoComplete="new-password" />
      <Text variant="caption">Changing it signs out every other phone using this account.</Text>
      <ErrorBanner error={change.error && !isApiError(change.error, "WRONG_PASSWORD") ? change.error : null} />
    </Screen>
  );
}
