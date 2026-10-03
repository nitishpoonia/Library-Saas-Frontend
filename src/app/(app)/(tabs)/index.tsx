import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import type { StudentStatusFilter } from "@/features/students/api";
import { useDashboard } from "@/features/libraries/queries";
import { subscriptionLabel } from "@/features/libraries/subscriptionLabel";
import { formatMonth, formatRupees } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import { Badge, Card, ErrorView, LoadingView, Screen, Section, StatCard, Text, colors, spacing } from "@/ui";

export default function HomeScreen() {
  const library = useLibrary();
  const dashboard = useDashboard(library.id);

  if (dashboard.isLoading) return <LoadingView />;
  if (!dashboard.data) return <ErrorView error={dashboard.error} onRetry={() => dashboard.refetch()} />;

  const d = dashboard.data;
  const sub = subscriptionLabel(d.subscription);

  return (
    <Screen refreshing={dashboard.isRefetching} onRefresh={() => dashboard.refetch()}>
      <View style={styles.header}>
        <Text variant="title">{d.library.name}</Text>
        <Badge label={sub.text} tone={sub.urgent ? "danger" : "info"} />
      </View>

      {!d.subscription.usable ? (
        <Card style={styles.warning}>
          <Text variant="bodyStrong" color={colors.dangerText}>
            Your subscription has ended
          </Text>
          <Text variant="body" color={colors.dangerText}>
            You can still see your data, but adding students or fees is paused until the owner renews.
          </Text>
        </Card>
      ) : null}

      <Section title="Needs attention">
        <View style={styles.row}>
          <StatCard style={styles.half} label="Overdue" value={String(d.students.overdue)} tone={d.students.overdue ? "danger" : "default"} hint="Seat held, not renewed" onPress={() => openStudents("overdue")} />
          <StatCard style={styles.half} label="Ending in 7 days" value={String(d.students.expiringSoon)} tone={d.students.expiringSoon ? "warning" : "default"} hint="Not renewed yet" onPress={() => openStudents("expiring")} />
        </View>
        <StatCard
          label="Fees pending"
          value={formatRupees(d.pendingFees)}
          tone={d.pendingFees > 0 ? "warning" : "success"}
          hint={`${d.students.withPendingFees} student${d.students.withPendingFees === 1 ? "" : "s"}`}
          onPress={() => openStudents("pending")}
        />
      </Section>

      <Section title="Today">
        <View style={styles.row}>
          <StatCard style={styles.half} label="Active students" value={String(d.students.active)} onPress={() => openStudents("active")} />
          <StatCard style={styles.half} label="Seats in use" value={`${d.seats.inUse} / ${d.seats.total}`} hint={`${d.seats.free} free`} />
        </View>
      </Section>

      {d.finance ? (
        <Section title={formatMonth(d.finance.month)}>
          <View style={styles.row}>
            <StatCard style={styles.half} label="Collected" value={formatRupees(d.finance.revenue)} tone="success" />
            <StatCard style={styles.half} label="Expenses" value={formatRupees(d.finance.expenses)} />
          </View>
          <StatCard label="Balance" value={formatRupees(d.finance.balance)} tone={d.finance.balance < 0 ? "danger" : "default"} />
        </Section>
      ) : null}
    </Screen>
  );
}

function openStudents(status: StudentStatusFilter) {
  router.navigate({ pathname: "/students", params: { status, at: String(Date.now()) } });
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  warning: { backgroundColor: colors.dangerSoft, borderColor: "#FECACA" },
});
