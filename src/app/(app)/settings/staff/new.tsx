import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";
import { isApiError, UserFacingError } from "@/api/errors";
import { password } from "@/features/auth/schemas";
import { applyServerErrors } from "@/features/auth/useServerErrors";
import { useStaffMutations } from "@/features/staff/queries";
import { cleanPhone, name, phone } from "@/features/students/schemas";
import { useLibrary } from "@/session/CurrentLibrary";
import { Button, Chips, ErrorBanner, FormTextField, Screen, Text, spacing } from "@/ui";

const schema = z.object({ name, phone, password, role: z.enum(["STAFF", "MANAGER"]) });
type Values = z.infer<typeof schema>;

export default function NewStaffScreen() {
  const library = useLibrary();
  const { add } = useStaffMutations(library.id);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", phone: "", password: "", role: "STAFF" } });

  const onSubmit = form.handleSubmit((v) =>
    add.mutate(
      { name: v.name, phone: cleanPhone(v.phone), password: v.password, role: v.role },
      {
        onSuccess: () => router.back(),
        onError: (error) => applyServerErrors(error, form.setError, ["name", "phone", "password"]),
      },
    ),
  );

  return (
    <Screen form edges={["bottom", "left", "right"]} footer={<Button title="Add login" onPress={onSubmit} loading={add.isPending} />}>
      <FormTextField control={form.control} name="name" label="Name" autoCapitalize="words" />
      <FormTextField control={form.control} name="phone" label="Mobile number" keyboardType="phone-pad" hint="They sign in with this number" />
      <FormTextField control={form.control} name="password" label="Password for them" hint="At least 8 characters. They can change it later." secureTextEntry />
      <Controller
        control={form.control}
        name="role"
        render={({ field }) => (
          <View style={{ gap: spacing.sm }}>
            <Text variant="label">Role</Text>
            <Chips
              options={[
                { value: "STAFF", label: "Staff" },
                { value: "MANAGER", label: "Manager" },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          </View>
        )}
      />
      <ErrorBanner
        error={
          add.error && !Object.keys(form.formState.errors).length
            ? isApiError(add.error, "ALREADY_STAFF")
              ? new UserFacingError("This person already has access to this branch.")
              : add.error
            : null
        }
      />
    </Screen>
  );
}
