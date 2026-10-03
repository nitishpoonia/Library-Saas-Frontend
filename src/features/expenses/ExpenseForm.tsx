import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";
import { todayLocal } from "@/lib/format";
import { Button, Chips, DateField, ErrorBanner, FieldLabel, FormTextField, Screen, Text, spacing } from "@/ui";
import type { ExpenseInput } from "./api";

const COMMON = ["Rent", "Electricity", "Internet", "Salary", "Cleaning", "Maintenance", "Other"];

const schema = z.object({
  title: z.string().trim().min(1, "Enter what it was for").max(100),
  category: z.string().trim().min(1, "Pick or type a category").max(50),
  amount: z.string().trim().refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0, "Enter an amount"),
  spentOn: z.string().refine((v) => v <= todayLocal(), "Can't be in the future"),
  notes: z.string().max(500),
});
type Values = z.infer<typeof schema>;

export type ExpenseFormInitial = Partial<Omit<Values, "amount">> & { amount?: number };

export function ExpenseForm({
  initial,
  submitLabel,
  saving,
  error,
  onSubmit,
  extra,
}: {
  initial?: ExpenseFormInitial;
  submitLabel: string;
  saving: boolean;
  error: unknown;
  onSubmit: (input: ExpenseInput) => void;
  extra?: React.ReactNode;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      category: initial?.category ?? "",
      amount: initial?.amount !== undefined ? String(initial.amount) : "",
      spentOn: initial?.spentOn ?? todayLocal(),
      notes: initial?.notes ?? "",
    },
  });

  const submit = form.handleSubmit((v) =>
    onSubmit({ title: v.title, category: v.category, amount: Number(v.amount), spentOn: v.spentOn, notes: v.notes.trim() || undefined }),
  );

  return (
    <Screen form footer={<Button title={submitLabel} onPress={submit} loading={saving} />}>
      <FormTextField control={form.control} name="title" label="What was it for?" placeholder="October rent" />
      <Controller
        control={form.control}
        name="category"
        render={({ field }) => (
          <View style={{ gap: spacing.sm }}>
            <FieldLabel>Category</FieldLabel>
            <Chips
              options={COMMON.map((c) => ({ value: c, label: c }))}
              value={COMMON.includes(field.value) ? field.value : null}
              onChange={field.onChange}
            />
            <FormTextField control={form.control} name="category" placeholder="Or type your own" />
          </View>
        )}
      />
      <FormTextField control={form.control} name="amount" label="Amount (₹)" keyboardType="decimal-pad" />
      <Controller
        control={form.control}
        name="spentOn"
        render={({ field, fieldState }) => (
          <DateField label="Date" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <FormTextField control={form.control} name="notes" label="Note (optional)" multiline />
      <ErrorBanner error={error} />
      {extra}
    </Screen>
  );
}
