import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";
import type { Membership, Payment } from "@/api/types";
import { paymentModeLabel } from "@/features/payments/paymentModes";
import { membershipStatus } from "@/features/students/membershipStatus";
import { useRemoveStudent, useStudent } from "@/features/students/queries";
import { formatDate, formatPhone, formatRupees } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import { Badge, Button, Card, ErrorView, LoadingView, Screen, Section, Text, colors, spacing } from "@/ui";

export default function StudentScreen() {
  const library = useLibrary();
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

  return (
    <Screen edges={["bottom", "left", "right"]} refreshing={student.isRefetching} onRefresh={() => student.refetch()}>
      <Stack.Screen
        options={{
          title: s.name,
          headerRight: () =>
            s.archived ? null : (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: "/students/[studentId]/edit", params: { studentId } })}
              >
                <Text variant="bodyStrong" color={colors.primary}>
                  Edit
                </Text>
              </Pressable>
            ),
        }}
      />

      <View style={styles.contact}>
        <Text variant="body" color={colors.textMuted} style={styles.flex}>
          {formatPhone(s.phone)}
        </Text>
        <IconButton icon="call-outline" label="Call" onPress={() => Linking.openURL(`tel:${s.phone}`)} />
        <IconButton icon="logo-whatsapp" label="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/${s.phone.replace("+", "")}`)} />
      </View>

      {s.pendingAmount > 0 ? (
        <Card style={styles.pending}>
          <Text variant="label" color="#92400E">
            Fees pending
          </Text>
          <Text variant="value" color={colors.warning}>
            {formatRupees(s.pendingAmount)}
          </Text>
        </Card>
      ) : null}

      {current ? (
        <Section title="Current membership">
          <MembershipCard m={current} />
          <View style={styles.actions}>
            {current.pendingAmount > 0 ? (
              <Button style={styles.flex} title="Collect fee" onPress={() => goPay(current, s.name)} />
            ) : null}
            <Button
              style={styles.flex}
              title="Renew"
              variant={current.pendingAmount > 0 ? "secondary" : "primary"}
              onPress={() => router.push({ pathname: "/students/[studentId]/renew", params: { studentId } })}
            />
          </View>
        </Section>
      ) : (
        <Card>
          <Text variant="bodyStrong">{s.archived ? "Removed" : "No active seat"}</Text>
          <Text variant="caption">Renew to give them a seat again.</Text>
          <Button
            title="Renew membership"
            onPress={() => router.push({ pathname: "/students/[studentId]/renew", params: { studentId } })}
          />
        </Card>
      )}

      <Section title="History">
        {s.memberships.map((m) => (
          <Card key={m.id} style={styles.history}>
            <MembershipCard m={m} flat />
            {m.payments.map((p) => (
              <PaymentRow key={p.id} p={p} />
            ))}
            {m.pendingAmount > 0 && m.id !== current?.id ? (
              <Button title={`Collect ${formatRupees(m.pendingAmount)}`} variant="secondary" onPress={() => goPay(m, s.name)} />
            ) : null}
          </Card>
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

function MembershipCard({ m, flat }: { m: Membership; flat?: boolean }) {
  const status = membershipStatus(m);
  const body = (
    <View style={styles.membership}>
      <View style={styles.rowBetween}>
        <Text variant="bodyStrong">
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
  return flat ? body : <Card>{body}</Card>;
}

function PaymentRow({ p }: { p: Payment }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/receipts/[paymentId]", params: { paymentId: String(p.id) } })}
      style={styles.payment}
    >
      <Ionicons name="receipt-outline" size={18} color={colors.textMuted} />
      <View style={styles.flex}>
        <Text variant="body" style={p.voided ? styles.voided : undefined}>
          {formatRupees(p.amount)} · {paymentModeLabel(p.mode)}
        </Text>
        <Text variant="caption">
          {p.receiptNumber} · {formatDate(p.paidAt.slice(0, 10))}
          {p.voided ? " · Cancelled" : ""}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
    </Pressable>
  );
}

function IconButton({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.iconButton}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contact: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconButton: { padding: spacing.sm, borderRadius: 999, backgroundColor: colors.primarySoft },
  pending: { backgroundColor: colors.warningSoft, borderColor: "#FDE68A" },
  actions: { flexDirection: "row", gap: spacing.md },
  membership: { gap: spacing.xs },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  history: { gap: spacing.md },
  payment: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.xs },
  voided: { textDecorationLine: "line-through", color: colors.textFaint },
});
