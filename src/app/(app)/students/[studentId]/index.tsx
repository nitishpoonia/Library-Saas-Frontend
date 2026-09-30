import { Stack, router, useLocalSearchParams } from "expo-router";
import { Alert, Linking, Platform, Pressable, View } from "react-native";
import type { Membership, Payment } from "@/api/types";
import { paymentModeLabel } from "@/features/payments/paymentModes";
import { membershipStatus } from "@/features/students/membershipStatus";
import { useRemoveStudent, useStudent } from "@/features/students/queries";
import { formatDate, formatPhone, formatRupees } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import {
  Badge,
  Button,
  Card,
  ErrorView,
  HeaderAction,
  Icon,
  ListRow,
  ListSection,
  LoadingView,
  Screen,
  Section,
  Text,
  icons,
  makeStyles,
  spacing,
  tileColors,
  useTheme,
  type IconName,
} from "@/ui";

export default function StudentScreen() {
  const library = useLibrary();
  const t = useTheme();
  const styles = useStyles();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const id = Number(studentId);
  const student = useStudent(library.id, id);
  const remove = useRemoveStudent(library.id, id);

  if (student.isLoading) return <LoadingView />;
  if (!student.data) return <ErrorView error={student.error} onRetry={() => student.refetch()} />;
  const s = student.data;
  const current = s.current;

  const confirmRemove = () =>
    Alert.alert(
      `Remove ${s.name}?`,
      "Their seat is freed right away. Their history and any pending fees stay on record.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => remove.mutate(undefined, { onSuccess: () => router.back() }) },
      ],
    );

  const renew = () => router.push({ pathname: "/students/[studentId]/renew", params: { studentId } });

  return (
    <Screen refreshing={student.isRefetching} onRefresh={() => student.refetch()}>
      <Stack.Screen options={{ title: s.name }} />
      {!s.archived ? (
        <HeaderAction
          label="Edit"
          icon={icons.edit}
          onPress={() => router.push({ pathname: "/students/[studentId]/edit", params: { studentId } })}
        />
      ) : null}

      {/* Contact card: phone number with quick actions, like a Contacts card. */}
      <View style={styles.contact}>
        <Text variant="body" color={t.colors.textMuted}>
          {formatPhone(s.phone)}
        </Text>
        <View style={styles.quick}>
          <QuickAction icon={icons.call} label="Call" onPress={() => Linking.openURL(`tel:${s.phone}`)} />
          <QuickAction
            icon={icons.message}
            label="WhatsApp"
            onPress={() => Linking.openURL(`https://wa.me/${s.phone.replace("+", "")}`)}
          />
        </View>
      </View>

      {s.pendingAmount > 0 ? (
        <Card style={styles.pending}>
          <Text variant="label" color={t.colors.warningText}>
            Fees pending
          </Text>
          <Text variant="value" color={t.colors.warning}>
            {formatRupees(s.pendingAmount)}
          </Text>
        </Card>
      ) : null}

      {current ? (
        <Section title="Current membership">
          <Card>
            <MembershipSummary m={current} />
          </Card>
          <View style={styles.actions}>
            {current.pendingAmount > 0 ? <Button style={styles.flex} title="Collect fee" onPress={() => goPay(current, s.name)} /> : null}
            <Button style={styles.flex} title="Renew" variant={current.pendingAmount > 0 ? "secondary" : "primary"} onPress={renew} />
          </View>
        </Section>
      ) : (
        <Card style={styles.noSeat}>
          <Text variant="bodyStrong">{s.archived ? "Removed" : "No active seat"}</Text>
          <Text variant="caption">Renew to give them a seat again.</Text>
          <Button title="Renew membership" onPress={renew} />
        </Card>
      )}

      <Section title="History">
        {s.memberships.map((m) => (
          <View key={m.id} style={styles.history}>
            <Card>
              <MembershipSummary m={m} />
            </Card>
            {m.payments.length ? (
              <ListSection>
                {m.payments.map((p) => (
                  <PaymentRow key={p.id} p={p} />
                ))}
              </ListSection>
            ) : null}
            {m.pendingAmount > 0 && m.id !== current?.id ? (
              <Button title={`Collect ${formatRupees(m.pendingAmount)}`} variant="secondary" onPress={() => goPay(m, s.name)} />
            ) : null}
          </View>
        ))}
      </Section>

      {!s.archived ? <Button title="Remove student" variant="danger" onPress={confirmRemove} loading={remove.isPending} /> : null}
    </Screen>
  );
}

function goPay(m: Membership, name: string) {
  router.push({
    pathname: "/memberships/[membershipId]/pay",
    params: { membershipId: String(m.id), pending: String(m.pendingAmount), name },
  });
}

function MembershipSummary({ m }: { m: Membership }) {
  const styles = useStyles();
  const status = membershipStatus(m);
  return (
    <View style={styles.membership}>
      <View style={styles.rowBetween}>
        <Text variant="bodyStrong" style={styles.flex}>
          Seat {m.seatLabel} · {m.timing}
        </Text>
        <Badge label={status.label} tone={status.tone} />
      </View>
      <Text variant="caption">
        {formatDate(m.startDate)} – {formatDate(m.endDate)} · {status.detail}
      </Text>
      <Text variant="caption">
        Fee {formatRupees(m.fee)} · Paid {formatRupees(m.amountPaid)}
        {m.pendingAmount > 0 ? ` · Pending ${formatRupees(m.pendingAmount)}` : ""}
      </Text>
    </View>
  );
}

function PaymentRow({ p }: { p: Payment }) {
  return (
    <ListRow
      title={`${formatRupees(p.amount)} · ${paymentModeLabel(p.mode)}${p.voided ? " (cancelled)" : ""}`}
      subtitle={`${p.receiptNumber} · ${formatDate(p.paidAt.slice(0, 10))}`}
      icon={icons.receipt}
      iconColor={p.voided ? tileColors.gray : tileColors.green}
      onPress={() => router.push({ pathname: "/receipts/[paymentId]", params: { paymentId: String(p.id) } })}
    />
  );
}

/** Round icon-over-label buttons, like the actions on an iOS contact card. */
function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      android_ripple={{ color: t.colors.ripple, foreground: true }}
      style={({ pressed }) => [styles.quickButton, Platform.OS === "ios" && pressed && styles.pressed]}
    >
      <Icon name={icon} size={20} color={Platform.OS === "ios" ? t.colors.primary : t.colors.onSecondaryContainer} />
      <Text variant="label" color={Platform.OS === "ios" ? t.colors.primary : t.colors.onSecondaryContainer}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  flex: { flex: 1 },
  contact: { gap: spacing.md },
  quick: { flexDirection: "row", gap: spacing.sm },
  quickButton: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: Platform.OS === "ios" ? 14 : 16,
    borderCurve: "continuous",
    backgroundColor: Platform.OS === "ios" ? t.colors.surface : t.colors.secondaryContainer,
    overflow: "hidden",
  },
  pressed: { opacity: 0.6 },
  pending: { backgroundColor: t.colors.warningSoft },
  noSeat: { gap: spacing.sm },
  actions: { flexDirection: "row", gap: spacing.md },
  membership: { gap: spacing.xs },
  rowBetween: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  history: { gap: spacing.sm },
}));
