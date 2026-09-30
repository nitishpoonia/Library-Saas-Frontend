import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { isApiError } from "@/api/errors";
import { applyServerErrors } from "@/features/auth/useServerErrors";
import { SeatPicker } from "@/features/seats/SeatPicker";
import { useSeatAvailability } from "@/features/seats/queries";
import { FeeFields, PeriodFields } from "@/features/students/PeriodFields";
import { useCreateStudent } from "@/features/students/queries";
import { cleanPhone, newStudentSchema, type NewStudentValues } from "@/features/students/schemas";
import { todayLocal } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import { Button, ErrorBanner, FormTextField, Screen, Section, Text, useTheme } from "@/ui";

export default function NewStudentScreen() {
  const library = useLibrary();
  const create = useCreateStudent(library.id);
  const t = useTheme();

  const form = useForm<NewStudentValues>({
    resolver: zodResolver(newStudentSchema),
    defaultValues: {
      name: "",
      phone: "",
      startDate: todayLocal(),
      days: "30",
      startTime: "09:00",
      endTime: "17:00",
      fee: "",
      paidNow: "",
      mode: "CASH",
      seatId: null,
    },
  });

  // Free seats for the chosen dates and time, refreshed whenever they change.
  const [startDate, days, startTime, endTime, seatId] = useWatch({
    control: form.control,
    name: ["startDate", "days", "startTime", "endTime", "seatId"],
  });
  const validDays = /^\d+$/.test(days) && Number(days) >= 1 && Number(days) <= 366;
  const availability = useSeatAvailability(
    library.id,
    validDays ? { startDate, days: Number(days), startTime, endTime } : null,
  );

  // A picked seat that stops being free (other dates or time) is unpicked.
  useEffect(() => {
    const seat = availability.data?.seats.find((s) => s.id === seatId);
    if (seatId !== null && seat && !seat.available) form.setValue("seatId", null);
  }, [availability.data, seatId, form]);

  const onSubmit = form.handleSubmit((v) => {
    const paid = Number(v.paidNow || 0);
    create.mutate(
      {
        name: v.name,
        phone: cleanPhone(v.phone),
        membership: {
          seatId: v.seatId!,
          startDate: v.startDate,
          days: Number(v.days),
          startTime: v.startTime,
          endTime: v.endTime,
          fee: Number(v.fee),
        },
        payment: paid > 0 ? { amount: paid, mode: v.mode } : undefined,
      },
      {
        onSuccess: ({ student, receipt }) => {
          if (receipt) {
            router.replace({ pathname: "/receipts/[paymentId]", params: { paymentId: String(receipt.id), fresh: "1" } });
          } else {
            router.replace({ pathname: "/students/[studentId]", params: { studentId: String(student.id) } });
          }
        },
        onError: (error) => {
          if (isApiError(error, "SEAT_UNAVAILABLE")) {
            // Someone else took it a moment ago: show the fresh map.
            form.setValue("seatId", null);
            void availability.refetch();
            return;
          }
          applyServerErrors(error, form.setError, ["name", "phone"]);
        },
      },
    );
  });

  const seatError = form.formState.errors.seatId?.message;

  return (
    <Screen form footer={<Button title="Add student" onPress={onSubmit} loading={create.isPending} />}>
      <Section title="Student">
        <FormTextField control={form.control} name="name" label="Name" autoCapitalize="words" />
        <FormTextField control={form.control} name="phone" label="Mobile number" keyboardType="phone-pad" placeholder="98765 43210" />
      </Section>

      <Section title="Membership">
        <PeriodFields control={form.control} />
      </Section>

      <Section title="Seat">
        {availability.data ? (
          <>
            <Text variant="caption">
              {availability.data.meta.availableCount} of {availability.data.meta.totalSeats} seats free for this time
            </Text>
            <Controller
              control={form.control}
              name="seatId"
              render={({ field }) => (
                <SeatPicker seats={availability.data.seats} value={field.value} onChange={field.onChange} />
              )}
            />
          </>
        ) : (
          <Text variant="caption">{validDays ? "Checking free seats…" : "Choose the dates first"}</Text>
        )}
        {seatError ? (
          <Text variant="label" color={t.colors.danger}>
            {seatError}
          </Text>
        ) : null}
      </Section>

      <Section title="Fees">
        <FeeFields control={form.control} />
      </Section>

      <ErrorBanner error={create.error && !Object.keys(form.formState.errors).length ? create.error : null} />
    </Screen>
  );
}
