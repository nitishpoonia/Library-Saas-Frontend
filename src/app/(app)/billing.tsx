import { Alert, StyleSheet, View } from "react-native";
import type { BillingPlan } from "@/api/types";
import { useMe } from "@/features/account/queries";
import { CheckoutCancelled, useBilling, useCheckout } from "@/features/billing/queries";
import { errorMessage } from "@/api/errors";
import { formatDate, formatRupees } from "@/lib/format";
import { Badge, Button, Card, ErrorView, LoadingView, Screen, Section, Text, colors, spacing } from "@/ui";

const PLAN_NAMES: Record<BillingPlan, string> = { MONTHLY: "1 month", QUARTERLY: "3 months", YEARLY: "12 months" };

/** The owner's subscription: status, plans priced for their branch count, history. */
export default function BillingScreen() {
  const me = useMe();
  const billing = useBilling();
  const checkout = useCheckout({ name: me.data?.user.name, contact: me.data?.user.phone, email: me.data?.user.email });

  if (billing.isLoading) return <LoadingView />;
  if (!billing.data) return <ErrorView error={billing.error} onRetry={() => billing.refetch()} />;
  const b = billing.data;
  const monthly = b.plans.find((p) => p.plan === "MONTHLY")?.amountPaise ?? 0;

  const buy = (request: Parameters<typeof checkout.mutate>[0]) =>
    checkout.mutate(request, {
      onSuccess: () => Alert.alert("Payment received", "Thank you! Your subscription is updated."),
      onError: (error) => {
        if (error instanceof CheckoutCancelled) return;
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
    <Screen edges={["bottom", "left", "right"]} refreshing={billing.isRefetching} onRefresh={() => billing.refetch()}>
      <Card style={styles.status}>
        <Badge label={status.label} tone={status.tone} />
        <Text variant="heading">{status.detail}</Text>
        <Text variant="caption">
          {b.branches} branch{b.branches === 1 ? "" : "es"} · plans are priced for all your branches
        </Text>
      </Card>

      {!b.razorpayKeyId ? (
        <Text variant="body" color={colors.warning}>
          Online payment isn't set up on the server yet.
        </Text>
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
              <Button title="Pay" onPress={() => buy({ kind: "PLAN", plan: p.plan })} disabled={!b.razorpayKeyId || checkout.isPending} />
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
            <Button title="Pay" variant="secondary" onPress={() => buy({ kind: "BRANCH_ADDON" })} disabled={!b.razorpayKeyId || checkout.isPending} />
          </Card>
        </Section>
      ) : null}

      {b.history.length ? (
        <Section title="Payments">
          {b.history.map((h) => (
            <View key={h.id} style={styles.history}>
              <View style={styles.flex}>
                <Text variant="body">{h.kind === "PLAN" && h.plan ? PLAN_NAMES[h.plan] : "Extra branch"}</Text>
                <Text variant="caption">
                  {h.paidAt ? formatDate(h.paidAt.slice(0, 10)) : ""}
                  {h.periodEnd ? ` · till ${formatDate(h.periodEnd.slice(0, 10))}` : ""}
                </Text>
              </View>
              <Text variant="bodyStrong">{formatRupees(h.amountPaise / 100)}</Text>
            </View>
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: { gap: spacing.sm },
  plan: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  flex: { flex: 1, gap: spacing.xs },
  history: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
