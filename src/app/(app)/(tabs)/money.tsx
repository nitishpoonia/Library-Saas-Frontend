import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExpenses } from "@/features/expenses/queries";
import { formatDate, formatMonth, formatRupees, todayLocal } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import { Card, EmptyView, ErrorView, LoadingView, Text, colors, spacing } from "@/ui";

function shiftMonth(month: string, by: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y!, m! - 1 + by, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Expenses by month (owner and manager only). */
export default function MoneyScreen() {
  const library = useLibrary();
  const thisMonth = todayLocal().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const expenses = useExpenses(library.id, month);
  const items = expenses.data?.pages.flatMap((p) => p.items) ?? [];
  const total = expenses.data?.pages[0]?.meta.totalAmount ?? 0;

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="title">Expenses</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Add expense" onPress={() => router.push("/expenses/new")} style={styles.add}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text variant="bodyStrong" color="#FFFFFF">
              Add
            </Text>
          </Pressable>
        </View>
        <View style={styles.monthRow}>
          <Pressable accessibilityLabel="Previous month" onPress={() => setMonth(shiftMonth(month, -1))} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text variant="subheading">{formatMonth(month)}</Text>
          <Pressable
            accessibilityLabel="Next month"
            disabled={month >= thisMonth}
            onPress={() => setMonth(shiftMonth(month, 1))}
            hitSlop={12}
          >
            <Ionicons name="chevron-forward" size={24} color={month >= thisMonth ? colors.border : colors.text} />
          </Pressable>
        </View>
        <Card>
          <Text variant="label">Spent this month</Text>
          <Text variant="value">{formatRupees(total)}</Text>
        </Card>
      </View>

      {expenses.isLoading ? (
        <LoadingView />
      ) : expenses.error && !items.length ? (
        <ErrorView error={expenses.error} onRetry={() => expenses.refetch()} />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(e) => String(e.id)}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (expenses.hasNextPage && !expenses.isFetchingNextPage) void expenses.fetchNextPage();
          }}
          refreshing={expenses.isRefetching}
          onRefresh={() => expenses.refetch()}
          ListEmptyComponent={<EmptyView title="No expenses this month" />}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              style={styles.row}
              onPress={() =>
                router.push({
                  pathname: "/expenses/[expenseId]",
                  params: {
                    expenseId: String(item.id),
                    title: item.title,
                    category: item.category,
                    amount: String(item.amount),
                    spentOn: item.spentOn,
                    notes: item.notes ?? "",
                  },
                })
              }
            >
              <View style={styles.flex}>
                <Text variant="bodyStrong">{item.title}</Text>
                <Text variant="caption">
                  {item.category} · {formatDate(item.spentOn, false)}
                </Text>
              </View>
              <Text variant="bodyStrong">{formatRupees(item.amount)}</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.md },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  add: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  flex: { flex: 1 },
});
