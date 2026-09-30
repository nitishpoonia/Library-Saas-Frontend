import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { PAYMENT_MODES } from "@/features/payments/paymentModes";
import { useRecordPayment } from "@/features/payments/queries";
import { formatRupees } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import { Button, Card, Chips, ErrorBanner, FormTextField, Screen, Text, colors } from "@/ui";

/** Collect fees against one membership period. */
export default function PayScreen() {
  const library = useLibrary();
  const params = useLocalSearchParams<{ membershipId: string; pending: string; name?: string }>();
  const pending = Number(params.pending ?? 0);
  const record = useRecordPayment(library.id, Number(params.membershipId));

  const schema = z.object({
    amount: z
      .string()
      .trim()
      .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0, "Enter an amount")
      .refine((v) => Number(v) <= pending, `At most ${formatRupees(pending)}`),
    mode: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER"]),
    notes: z.string().max(500),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { amount: String(pending), mode: "CASH", notes: "" },
  });

  const onSubmit = form.handleSubmit((v) =>
    record.mutate(
      { amount: Number(v.amount), mode: v.mode, notes: v.notes.trim() || undefined },
      {
        onSuccess: (receipt) =>
          router.replace({ pathname: "/receipts/[paymentId]", params: { paymentId: String(receipt.id), fresh: "1" } }),
      },
    ),
  );

  return (
    <Screen form edges={["bottom", "left", "right"]} footer={<Button title="Record payment" onPress={onSubmit} loading={record.isPending} />}>
      <Card>
        <Text variant="label">{params.name ?? "Pending"}</Text>
        <Text variant="value" color={colors.warning}>
          {formatRupees(pending)} pending
        </Text>
      </Card>
      <FormTextField control={form.control} name="amount" label="Amount (₹)" keyboardType="decimal-pad" />
      <Controller
        control={form.control}
        name="mode"
        render={({ field }) => (
          <>
            <Text variant="label">Paid by</Text>
            <Chips options={PAYMENT_MODES} value={field.value} onChange={field.onChange} />
          </>
        )}
      />
      <FormTextField control={form.control} name="notes" label="Note (optional)" placeholder="e.g. UPI ref 4521" />
      <ErrorBanner error={record.error} />
    </Screen>
  );
}
