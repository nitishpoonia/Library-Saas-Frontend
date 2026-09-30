import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { Membership, StudentDetail } from "@/api/types";
import { isApiError } from "@/api/errors";
import { SeatPicker } from "@/features/seats/SeatPicker";
import { useSeatAvailability } from "@/features/seats/queries";
import { FeeFields, PeriodFields } from "@/features/students/PeriodFields";
import { useRenewMembership, useStudent } from "@/features/students/queries";
import { renewalSchema, type RenewalValues } from "@/features/students/schemas";
import { formatDate, todayLocal } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import { Button, Card, ErrorBanner, ErrorView, ListSection, ListSwitchRow, LoadingView, Screen, Section, Text, useTheme } from "@/ui";

/** The day after a date: renewals continue straight after the current period. */
function nextDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d! + 1));
  return date.toISOString().slice(0, 10);
}

export default function RenewScreen() {
  const library = useLibrary();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const student = useStudent(library.id, Number(studentId));

  if (student.isLoading) return <LoadingView />;
  if (!student.data) return <ErrorView error={student.error} onRetry={() => student.refetch()} />;
  return <RenewForm student={student.data} />;
}

function RenewForm({ student }: { student: StudentDetail }) {
  const library = useLibrary();
  const renew = useRenewMembership(library.id, student.id);
  const t = useTheme();

  // The period being continued, if the student still holds a seat.
  const live: Membership | undefined = student.memberships.find((m) => m.status === "ACTIVE" || m.status === "OVERDUE");
  const latest = live ?? student.memberships[0];
  const continuesFrom = live ? nextDay(live.endDate) : null;

  const form = useForm<RenewalValues>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      startDate: continuesFrom ?? todayLocal(),
      days: "30",
      startTime: latest?.startTime ?? "09:00",
      endTime: latest?.endTime ?? "17:00",
      fee: latest ? String(latest.fee) : "",
      paidNow: latest ? String(latest.fee) : "",
      mode: "CASH",
      changeSeat: !live,
      seatId: null,
    },
  });

  const [changeSeat, startDate, days, startTime, endTime, seatId] = useWatch({
    control: form.control,
    name: ["changeSeat", "startDate", "days", "startTime", "endTime", "seatId"],
  });
  const validDays = /^\d+$/.test(days) && Number(days) >= 1 && Number(days) <= 366;
  const availability = useSeatAvailability(
    library.id,
    changeSeat && validDays ? { startDate, days: Number(days), startTime, endTime } : null,
  );

  useEffect(() => {
    const seat = availability.data?.seats.find((s) => s.id === seatId);
    if (seatId !== null && seat && !seat.available) form.setValue("seatId", null);
  }, [availability.data, seatId, form]);

  const onSubmit = form.handleSubmit((v) => {
    const paid = Number(v.paidNow || 0);
    renew.mutate(
      {
        days: Number(v.days),
        fee: Number(v.fee),
        startDate: v.startDate,
        ...(v.changeSeat ? { seatId: v.seatId!, startTime: v.startTime, endTime: v.endTime } : {}),
        payment: paid > 0 ? { amount: paid, mode: v.mode } : undefined,
      },
      {
        onSuccess: ({ receipt }) => {
          if (receipt) {
            router.replace({ pathname: "/receipts/[paymentId]", params: { paymentId: String(receipt.id), fresh: "1" } });
          } else {
            router.back();
          }
        },
        onError: (error) => {
          if (isApiError(error, "SEAT_UNAVAILABLE")) {
            form.setValue("changeSeat", true);
            void availability.refetch();
          }
        },
      },
    );
  });

  return (
    <Screen form footer={<Button title="Renew" onPress={onSubmit} loading={renew.isPending} />}>
      <Stack.Screen options={{ title: `Renew ${student.name}` }} />
      {live ? (
        <Card>
          <Text variant="body">
            Continues after {formatDate(live.endDate)} on seat {live.seatLabel}, {live.timing}.
            {live.status === "OVERDUE" ? " Their seat was held for them, so the new period starts from the old end date." : ""}
          </Text>
        </Card>
      ) : null}

      <Section title="New period">
        <PeriodFields control={form.control} showTimes={changeSeat} />
        {continuesFrom && startDate < continuesFrom ? (
          <Text variant="label" color={t.colors.danger}>
            Can't start before {formatDate(continuesFrom)}, when the current period ends.
          </Text>
        ) : null}
      </Section>

      {live ? (
        <Controller
          control={form.control}
          name="changeSeat"
          render={({ field }) => (
            <ListSection>
              <ListSwitchRow title="Change seat or time" value={field.value} onValueChange={field.onChange} />
            </ListSection>
          )}
        />
      ) : null}

      {changeSeat ? (
        <Section title="Seat">
          {availability.data ? (
            <Controller
              control={form.control}
              name="seatId"
              render={({ field }) => <SeatPicker seats={availability.data.seats} value={field.value} onChange={field.onChange} />}
            />
          ) : (
            <Text variant="caption">Checking free seats…</Text>
          )}
          {form.formState.errors.seatId ? (
            <Text variant="label" color={t.colors.danger}>
              {form.formState.errors.seatId.message}
            </Text>
          ) : null}
        </Section>
      ) : null}

      <Section title="Fees">
        <FeeFields control={form.control} />
      </Section>

      <ErrorBanner error={renew.error} />
    </Screen>
  );
}
