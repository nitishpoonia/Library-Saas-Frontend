import { Stack, router } from "expo-router";
import { View } from "react-native";
import type { StudentStatusFilter } from "@/features/students/api";
import { useDashboard } from "@/features/libraries/queries";
import { subscriptionLabel } from "@/features/libraries/subscriptionLabel";
import { formatMonth, formatRupees } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import { Badge, Card, ErrorView, Icon, LoadingView, Screen, Section, StatCard, Text, icons, makeStyles, spacing, useTheme } from "@/ui";

export default function HomeScreen() {
  const library = useLibrary();
  const dashboard = useDashboard(library.id);
  const t = useTheme();
  const styles = useStyles();

  // The branch name is the page title (a large title on iOS).
  const title = <Stack.Screen options={{ title: dashboard.data?.library.name ?? library.name }} />;

  if (dashboard.isLoading || !dashboard.data) {
    return (
      <>
        {title}
        {dashboard.isLoading ? <LoadingView /> : <ErrorView error={dashboard.error} onRetry={() => dashboard.refetch()} />}
      </>
    );
  }

  const d = dashboard.data;
  const sub = subscriptionLabel(d.subscription);

  return (
    <Screen refreshing={dashboard.isRefetching} onRefresh={() => dashboard.refetch()}>
      {title}
      <Badge label={sub.text} tone={sub.urgent ? "danger" : "info"} />

      {!d.subscription.usable ? (
        <Card style={styles.warning}>
          <View style={styles.warningTitle}>
            <Icon name={icons.warning} size={18} color={t.colors.dangerText} />
            <Text variant="bodyStrong" color={t.colors.dangerText}>
              Your subscription has ended
            </Text>
          </View>
          <Text variant="caption" color={t.colors.dangerText}>
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

const useStyles = makeStyles((t) => ({
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  warning: { backgroundColor: t.colors.dangerSoft, gap: spacing.sm },
  warningTitle: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
}));
