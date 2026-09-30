import { useState } from "react";
import { Controller, type Control, type FieldValues, type Path, useWatch } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { PAYMENT_MODES } from "@/features/payments/paymentModes";
import { formatRupees } from "@/lib/format";
import { Chips, DateField, FieldLabel, FormTextField, Text, TimeField, spacing, useTheme } from "@/ui";

type PeriodValues = {
  startDate: string;
  days: string;
  startTime: string;
  endTime: string;
  fee: string;
  paidNow: string;
  mode: string;
};

const DAY_PRESETS = [
  { value: "30", label: "1 month" },
  { value: "60", label: "2 months" },
  { value: "90", label: "3 months" },
  { value: "custom", label: "Other" },
];

/** Dates and daily time for a membership period. */
export function PeriodFields<T extends FieldValues & PeriodValues>({
  control,
  showStartDate = true,
  showTimes = true,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any, any>;
  showStartDate?: boolean;
  /** Renewals keep the current time unless the owner chooses to change it. */
  showTimes?: boolean;
}) {
  const t = useTheme();
  const days = useWatch({ control, name: "days" as Path<T> }) as string;
  const [custom, setCustom] = useState(!["30", "60", "90"].includes(days));

  return (
    <View style={styles.group}>
      {showStartDate ? (
        <Controller
          control={control}
          name={"startDate" as Path<T>}
          render={({ field }) => <DateField label="Starts on" value={field.value} onChange={field.onChange} />}
        />
      ) : null}

      <Controller
        control={control}
        name={"days" as Path<T>}
        render={({ field, fieldState }) => (
          <View style={styles.group}>
            <FieldLabel>For</FieldLabel>
            <Chips
              options={DAY_PRESETS}
              value={custom ? "custom" : field.value}
              onChange={(v) => {
                setCustom(v === "custom");
                if (v !== "custom") field.onChange(v);
              }}
            />
            {custom ? (
              <FormTextField control={control} name={"days" as Path<T>} label="Number of days" keyboardType="number-pad" />
            ) : fieldState.error ? (
              <Text variant="label" color={t.colors.danger} style={styles.error}>
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      {showTimes ? (
        <View style={styles.group}>
          <View style={styles.row}>
            <Controller
              control={control}
              name={"startTime" as Path<T>}
              render={({ field }) => <TimeField label="From" value={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={control}
              name={"endTime" as Path<T>}
              render={({ field }) => <TimeField label="To" value={field.value} onChange={field.onChange} />}
            />
          </View>
          <Text variant="label" style={styles.hint}>
            A slot like 10 PM to 2 AM runs past midnight. Same start and end means the full day.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Fee for the period and what's being paid right now. */
export function FeeFields<T extends FieldValues & PeriodValues>({
  control,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: { control: Control<T, any, any> }) {
  const t = useTheme();
  const [fee, paidNow] = useWatch({ control, name: ["fee", "paidNow"] as Path<T>[] }) as unknown as [string, string];
  const pending = Math.max(0, Number(fee || 0) - Number(paidNow || 0));

  return (
    <View style={styles.group}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <FormTextField control={control} name={"fee" as Path<T>} label="Fee (₹)" keyboardType="decimal-pad" />
        </View>
        <View style={styles.flex}>
          <FormTextField control={control} name={"paidNow" as Path<T>} label="Paid now (₹)" keyboardType="decimal-pad" placeholder="0" />
        </View>
      </View>
      <Controller
        control={control}
        name={"mode" as Path<T>}
        render={({ field }) => (
          <View style={styles.group}>
            <FieldLabel>Paid by</FieldLabel>
            <Chips options={PAYMENT_MODES} value={field.value} onChange={field.onChange} />
          </View>
        )}
      />
      {fee ? (
        <Text variant="bodyStrong" color={pending > 0 ? t.colors.warning : t.colors.success} style={styles.hint}>
          {pending > 0 ? `${formatRupees(pending)} will be pending` : "Fully paid"}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  // Helper lines sit under fields, indented like the fields' own hints.
  hint: { paddingHorizontal: spacing.lg },
  error: { paddingHorizontal: spacing.lg },
});
