import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { router } from "expo-router";
import { z } from "zod";
import { isApiError } from "@/api/errors";
import { formatRupees } from "@/lib/format";
import { Button, Card, ErrorBanner, FormTextField, Text, useTheme } from "@/ui";
import { applyServerErrors } from "../auth/useServerErrors";
import { useCreateLibrary } from "./queries";

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
  address: z.string().trim().min(2, "At least 2 characters").max(300),
  seatCount: z.coerce.number<string>().int("Whole number").min(1, "At least 1 seat").max(1000, "At most 1000 seats"),
});

type Values = z.input<typeof schema>;

/** Creates a branch. Used for the first branch after signup and for adding more. */
export function LibraryForm({ onCreated, submitLabel }: { onCreated: (id: number) => void; submitLabel: string }) {
  const form = useForm<Values, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", address: "", seatCount: "" },
  });
  const create = useCreateLibrary();
  const t = useTheme();

  const onSubmit = form.handleSubmit((values) =>
    create.mutate(values, {
      onSuccess: (library) => onCreated(library.id),
      onError: (error) => applyServerErrors(error, form.setError, ["name", "address", "seatCount"]),
    }),
  );

  const needsPayment = isApiError(create.error, "BRANCH_PAYMENT_REQUIRED");
  const amountPaise = needsPayment
    ? ((create.error as { details?: { amountPaise?: number } }).details?.amountPaise ?? 0)
    : 0;

  return (
    <>
      <FormTextField control={form.control} name="name" label="Library name" placeholder="Focus Library" returnKeyType="next" />
      <FormTextField control={form.control} name="address" label="Address" placeholder="Sector 14, Hisar" returnKeyType="next" />
      <FormTextField
        control={form.control}
        name="seatCount"
        label="Number of seats"
        hint="Seats are numbered 1, 2, 3… You can add or rename seats later."
        keyboardType="number-pad"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />
      {needsPayment ? (
        <>
          <Card style={{ backgroundColor: t.colors.warningSoft }}>
            <Text variant="caption" color={t.colors.warningText}>
              Your plan covers your current branches. Adding one more costs {formatRupees(amountPaise / 100)} until your plan
              renews.
            </Text>
          </Card>
          <Button title="Pay for one more branch" variant="secondary" onPress={() => router.push("/billing")} />
        </>
      ) : (
        <ErrorBanner error={create.error && !Object.keys(form.formState.errors).length ? create.error : null} />
      )}
      <Button title={submitLabel} onPress={onSubmit} loading={create.isPending} />
    </>
  );
}
