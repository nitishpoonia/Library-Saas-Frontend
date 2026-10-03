import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateProfile } from "@/features/account/mutations";
import { useMe } from "@/features/account/queries";
import { applyServerErrors } from "@/features/auth/useServerErrors";
import { cleanPhone, name, phone } from "@/features/students/schemas";
import { Button, ErrorBanner, FormTextField, LoadingView, Screen } from "@/ui";

const schema = z.object({
  name,
  email: z.string().trim().refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email"),
  phone: z.string().trim().refine((v) => v === "" || phone.safeParse(v).success, "Enter a 10-digit mobile number"),
});
type Values = z.infer<typeof schema>;

export default function ProfileScreen() {
  const me = useMe();
  if (!me.data) return <LoadingView />;
  const u = me.data.user;
  return <ProfileForm initial={{ name: u.name, email: u.email ?? "", phone: u.phone?.replace(/^\+91/, "") ?? "" }} />;
}

function ProfileForm({ initial }: { initial: Values }) {
  const update = useUpdateProfile();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial });

  const onSubmit = form.handleSubmit((v) =>
    update.mutate(
      {
        name: v.name,
        ...(v.email && v.email !== initial.email ? { email: v.email } : {}),
        ...(v.phone && v.phone !== initial.phone ? { phone: cleanPhone(v.phone) } : {}),
      },
      {
        onSuccess: () => router.back(),
        onError: (error) => applyServerErrors(error, form.setError, ["name", "email", "phone"]),
      },
    ),
  );

  return (
    <Screen form edges={["bottom", "left", "right"]} footer={<Button title="Save" onPress={onSubmit} loading={update.isPending} />}>
      <FormTextField control={form.control} name="name" label="Name" autoCapitalize="words" />
      <FormTextField control={form.control} name="phone" label="Mobile number" keyboardType="phone-pad" />
      <FormTextField control={form.control} name="email" label="Email" keyboardType="email-address" autoCapitalize="none" />
      <ErrorBanner error={update.error && !Object.keys(form.formState.errors).length ? update.error : null} />
    </Screen>
  );
}
