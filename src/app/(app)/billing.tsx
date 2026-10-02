import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import type { BillingPlan } from "@/api/types";
import { useMe } from "@/features/account/queries";
import {
  CheckoutCancelled,
  PaymentNotConfirmed,
  refreshAfterPayment,
  useBilling,
  useCheckout,
} from "@/features/billing/queries";
import { errorMessage } from "@/api/errors";
import { formatDate, formatRupees } from "@/lib/format";
import { Badge, Button, Card, ErrorView, ListRow, ListSection, LoadingView, Screen, Section, Text, makeStyles, spacing, useTheme } from "@/ui";

/** How often to ask the server whether a paid-but-unconfirmed payment has landed. */
const CONFIRM_POLL_MS = 5_000;
/** After this long, tell the owner it's taking a while (but keep checking). */
const CONFIRM_SLOW_MS = 2 * 60_000;

const PLAN_NAMES: Record<BillingPlan, string> = { MONTHLY: "1 month", QUARTERLY: "3 months", YEARLY: "12 months" };

/** The owner's subscription: status, plans priced for their branch count, history. */
export default function BillingScreen() {
  const me = useMe();
  const t = useTheme();
  const styles = useStyles();
  const queryClient = useQueryClient();
  // A payment Razorpay took but the app couldn't confirm: wait for the webhook to land it.
  const [confirming, setConfirming] = useState<{ id: number; since: number } | null>(null);
  const [slow, setSlow] = useState(false);
  const billing = useBilling(confirming ? CONFIRM_POLL_MS : undefined);
  const checkout = useCheckout({ name: me.data?.user.name, contact: me.data?.user.phone, email: me.data?.user.email });

  const confirmed = !!confirming && !!billing.data?.history.some((h) => h.id === confirming.id);
  useEffect(() => {
    if (!confirming) return;
    if (confirmed) {
      setConfirming(null);
      setSlow(false);
      refreshAfterPayment(queryClient);
      Alert.alert("Payment confirmed", "Thank you! Your subscription is updated.");
      return;
    }
    const timer = setTimeout(() => setSlow(true), Math.max(0, confirming.since + CONFIRM_SLOW_MS - Date.now()));
    return () => clearTimeout(timer);
  }, [confirming, confirmed, queryClient]);

  if (billing.isLoading) return <LoadingView />;
  if (!billing.data) return <ErrorView error={billing.error} onRetry={() => billing.refetch()} />;
  const b = billing.data;
  const monthly = b.plans.find((p) => p.plan === "MONTHLY")?.amountPaise ?? 0;

  const buy = (request: Parameters<typeof checkout.mutate>[0]) =>
    checkout.mutate(request, {
      onSuccess: () => Alert.alert("Payment received", "Thank you! Your subscription is updated."),
      onError: (error) => {
        if (error instanceof CheckoutCancelled) return;
        if (error instanceof PaymentNotConfirmed) {
          // The money was taken. Never suggest paying again here.
          setConfirming({ id: error.subscriptionPaymentId, since: Date.now() });
          return;
        }
        Alert.alert("Payment didn't go through", errorMessage(error));
      },
    });

  const status =
    b.status === "TRIALING" && b.usable
      ? { label: "Free trial", detail: `Ends ${formatDate(b.trialEndsAt.slice(0, 10))}`, tone: "info" as const }
      : b.status === "ACTIVE" && b.usable && b.currentPeriodEnd
        ? { label: "Active", detail: `Paid till ${formatDate(b.currentPeriodEnd.slice(0, 10))}`, tone: "success" as const }
        : { label: "Ended", detail: "Renew to keep adding students and fees", tone: "danger" as const };

  return (
    <Screen refreshing={billing.isRefetching} onRefresh={() => billing.refetch()}>
      <Card style={styles.status}>
        <Badge label={status.label} tone={status.tone} />
        <Text variant="heading">{status.detail}</Text>
        <Text variant="caption">
          {b.branches} branch{b.branches === 1 ? "" : "es"} · plans are priced for all your branches
        </Text>
      </Card>

      {confirming ? (
        <Card style={styles.confirming}>
          <Text variant="bodyStrong" color={t.colors.warningText}>
            Payment received. Confirming it with Razorpay…
          </Text>
          <Text variant="caption" color={t.colors.warningText}>
            {slow
              ? "This is taking longer than usual. Your money is safe and your plan will update on its own. Please don't pay again; if nothing changes within a day, contact support."
              : "This usually takes under a minute. Please don't pay again."}
          </Text>
        </Card>
      ) : null}

      {!b.razorpayKeyId ? (
        <Card style={styles.notice}>
          <Text variant="caption" color={t.colors.warningText}>
            Online payment isn't set up on the server yet.
          </Text>
        </Card>
      ) : null}

      <Section title={b.status === "ACTIVE" && b.usable ? "Renew" : "Choose a plan"}>
        {b.plans.map((p) => {
          const saving = monthly * p.months - p.amountPaise;
          return (
            <Card key={p.plan} style={styles.plan}>
              <View style={styles.flex}>
                <Text variant="bodyStrong">{PLAN_NAMES[p.plan]}</Text>
                <Text variant="value">{formatRupees(p.amountPaise / 100)}</Text>
                {saving > 0 ? <Badge label={`Save ${formatRupees(saving / 100)}`} tone="success" /> : null}
              </View>
              <Button title="Pay" onPress={() => buy({ kind: "PLAN", plan: p.plan })} disabled={!b.razorpayKeyId || checkout.isPending || !!confirming} />
            </Card>
          );
        })}
        <Text variant="caption">A new plan starts when your current trial or plan ends, so you never lose days.</Text>
      </Section>

      {b.branchAddon ? (
        <Section title="Adding a branch?">
          <Card style={styles.plan}>
            <View style={styles.flex}>
              <Text variant="body">One more branch until {formatDate(b.branchAddon.until.slice(0, 10))}</Text>
              <Text variant="value">{formatRupees(b.branchAddon.amountPaise / 100)}</Text>
              <Text variant="caption">
                Paid for {b.billedBranches} of {b.branches} branch{b.branches === 1 ? "" : "es"}
              </Text>
            </View>
            <Button title="Pay" variant="secondary" onPress={() => buy({ kind: "BRANCH_ADDON" })} disabled={!b.razorpayKeyId || checkout.isPending || !!confirming} />
          </Card>
        </Section>
      ) : null}

      {b.history.length ? (
        <ListSection title="Payments">
          {b.history.map((h) => (
            <ListRow
              key={h.id}
              title={h.kind === "PLAN" && h.plan ? PLAN_NAMES[h.plan] : "Extra branch"}
              subtitle={`${h.paidAt ? formatDate(h.paidAt.slice(0, 10)) : ""}${h.periodEnd ? ` · till ${formatDate(h.periodEnd.slice(0, 10))}` : ""}`}
              value={formatRupees(h.amountPaise / 100)}
            />
          ))}
        </ListSection>
      ) : null}
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  status: { gap: spacing.sm },
  notice: { backgroundColor: t.colors.warningSoft },
  confirming: { gap: spacing.xs, backgroundColor: t.colors.warningSoft },
  plan: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  flex: { flex: 1, gap: spacing.xs },
}));
