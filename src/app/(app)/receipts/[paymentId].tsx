import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Platform, View, type ColorValue } from "react-native";
import { errorMessage } from "@/api/errors";
import { paymentModeLabel } from "@/features/payments/paymentModes";
import { useReceipt, useVoidPayment } from "@/features/payments/queries";
import { sendReceiptOnWhatsApp, shareReceiptPdf } from "@/features/payments/receipt";
import { formatDate, formatRupees } from "@/lib/format";
import { useCanManage, useLibrary } from "@/session/CurrentLibrary";
import {
  Badge,
  Button,
  Card,
  ErrorView,
  Icon,
  LoadingView,
  Screen,
  Text,
  TextField,
  icons,
  makeStyles,
  spacing,
  useTheme,
} from "@/ui";

/**
 * A receipt, loaded from the server so it can be re-shared any time, from any phone
 * (REVIEW FU8). Managers can cancel a payment entered by mistake.
 */
export default function ReceiptScreen() {
  const library = useLibrary();
  const canManage = useCanManage();
  const { paymentId, fresh } = useLocalSearchParams<{ paymentId: string; fresh?: string }>();
  const receipt = useReceipt(library.id, Number(paymentId));
  const voidPayment = useVoidPayment(library.id, Number(paymentId));
  const [sharing, setSharing] = useState(false);
  const [voidReason, setVoidReason] = useState<string | null>(null);
  const t = useTheme();
  const styles = useStyles();

  if (receipt.isLoading) return <LoadingView />;
  if (!receipt.data) return <ErrorView error={receipt.error} onRetry={() => receipt.refetch()} />;
  const r = receipt.data;

  const share = async () => {
    setSharing(true);
    try {
      await shareReceiptPdf(r);
    } catch (error) {
      Alert.alert("Couldn't share the receipt", errorMessage(error));
    } finally {
      setSharing(false);
    }
  };

  const confirmVoid = () => {
    const reason = voidReason?.trim() ?? "";
    if (reason.length < 3) return Alert.alert("Add a reason", "Say why this payment is being cancelled.");
    Alert.alert("Cancel this payment?", `${formatRupees(r.amount)} goes back to pending. The receipt number stays on record.`, [
      { text: "Keep it", style: "cancel" },
      { text: "Cancel payment", style: "destructive", onPress: () => voidPayment.mutate(reason, { onSuccess: () => setVoidReason(null) }) },
    ]);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: `Receipt ${r.receiptNumber}` }} />

      {fresh ? (
        <View style={styles.success}>
          <Icon name={icons.checkCircle} size={28} color={t.colors.success} />
          <Text variant="subheading" color={t.colors.successText}>
            Payment recorded
          </Text>
        </View>
      ) : null}

      <Card style={styles.card}>
        <Text variant="heading">{r.libraryName}</Text>
        <Text variant="caption">{r.libraryAddress}</Text>
        {r.voided ? <Badge label={`Cancelled: ${r.voidReason ?? ""}`} tone="danger" /> : null}
        <Row label="Date" value={formatDate(r.paidAt.slice(0, 10))} />
        <Row label="Student" value={r.studentName} strong />
        <Row label="Seat" value={`${r.seatLabel ?? "-"} · ${r.timing}`} />
        <Row label="Period" value={`${formatDate(r.periodStart, false)} – ${formatDate(r.periodEnd)}`} />
        <Row label="Paid now" value={`${formatRupees(r.amount)} · ${paymentModeLabel(r.mode)}`} strong />
        <Row label="Total paid" value={`${formatRupees(r.totalPaid)} of ${formatRupees(r.fee)}`} />
        {r.pendingAmount > 0 ? <Row label="Pending" value={formatRupees(r.pendingAmount)} tone={t.colors.warning} /> : null}
        {r.notes ? <Row label="Note" value={r.notes} /> : null}
      </Card>

      <Button
        title="Send on WhatsApp"
        icon={<Icon name={icons.message} size={18} color={t.colors.onPrimary} />}
        onPress={() => sendReceiptOnWhatsApp(r)}
      />
      <Button
        title="Share PDF"
        variant="secondary"
        icon={<Icon name={icons.share} size={18} color={Platform.OS === "ios" ? t.colors.primary : t.colors.onSecondaryContainer} />}
        loading={sharing}
        onPress={share}
      />
      {fresh ? <Button title="Done" variant="ghost" onPress={() => router.back()} /> : null}

      {canManage && !r.voided ? (
        voidReason === null ? (
          <Button title="Cancel this payment" variant="danger" onPress={() => setVoidReason("")} />
        ) : (
          <View style={styles.void}>
            <TextField label="Why is it being cancelled?" value={voidReason} onChangeText={setVoidReason} placeholder="Entered twice" />
            <Button title="Cancel payment" variant="danger" onPress={confirmVoid} loading={voidPayment.isPending} />
          </View>
        )
      ) : null}
    </Screen>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: ColorValue }) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text variant="caption">{label}</Text>
      <Text variant={strong ? "bodyStrong" : "body"} color={tone} style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  success: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 14,
    borderCurve: "continuous",
    backgroundColor: t.colors.successSoft,
  },
  card: { gap: spacing.sm },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: t.colors.border,
  },
  value: { flexShrink: 1, textAlign: "right" },
  void: { gap: spacing.md },
}));
