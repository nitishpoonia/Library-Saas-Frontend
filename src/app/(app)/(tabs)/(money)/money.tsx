import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import { errorMessage } from "@/api/errors";
import { useExpenses } from "@/features/expenses/queries";
import { formatDate, formatMonth, formatRupees, todayLocal } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import {
  Button,
  Card,
  EmptyView,
  Icon,
  ListCell,
  PrimaryAction,
  Text,
  icons,
  listContentStyle,
  makeStyles,
  spacing,
  useTheme,
  type IconName,
} from "@/ui";

function shiftMonth(month: string, by: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y!, m! - 1 + by, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Expenses by month (owner and manager only). */
export default function MoneyScreen() {
  const library = useLibrary();
  const t = useTheme();
  const styles = useStyles();
  const thisMonth = todayLocal().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const expenses = useExpenses(library.id, month);
  const items = expenses.data?.pages.flatMap((p) => p.items) ?? [];
  // While another month loads, the previous one stays on screen and the arrows stay put.
  const switching = expenses.isPlaceholderData;
  const total = expenses.data?.pages[0]?.meta.totalAmount ?? 0;

  const header = (
    <View style={styles.header}>
      <View style={styles.monthRow}>
        <StepButton label="Previous month" icon={icons.back} onPress={() => setMonth(shiftMonth(month, -1))} />
        <Text variant="subheading" accessibilityRole="header">
          {formatMonth(month)}
        </Text>
        <StepButton
          label="Next month"
          icon={icons.forward}
          disabled={month >= thisMonth}
          onPress={() => setMonth(shiftMonth(month, 1))}
        />
      </View>
      <Card>
        <Text variant="label">Spent this month</Text>
        <View style={styles.totalRow}>
          <Text variant="value">{switching || expenses.isLoading ? "—" : formatRupees(total)}</Text>
          {switching ? <ActivityIndicator size="small" color={Platform.OS === "ios" ? undefined : t.colors.primary} /> : null}
        </View>
      </Card>
    </View>
  );

  // Loading and errors render inside the list, under the month header, so you can
  // always step to another month.
  const empty = expenses.isLoading ? (
    <ActivityIndicator style={styles.loading} size="large" color={Platform.OS === "ios" ? undefined : t.colors.primary} />
  ) : expenses.error ? (
    <EmptyView
      icon={icons.warning}
      title={errorMessage(expenses.error)}
      action={<Button title="Try again" variant="secondary" onPress={() => expenses.refetch()} />}
    />
  ) : (
    <EmptyView icon={icons.receipt} title="No expenses this month" />
  );

  return (
    <View style={styles.page}>
      <FlashList
        data={items}
        keyExtractor={(e) => String(e.id)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={listContentStyle}
        ListHeaderComponent={header}
        onEndReached={() => {
          if (expenses.hasNextPage && !expenses.isFetchingNextPage && !switching) void expenses.fetchNextPage();
        }}
        refreshing={expenses.isRefetching && !switching}
        onRefresh={() => expenses.refetch()}
        ListEmptyComponent={empty}
        renderItem={({ item, index }) => (
          <ListCell
            first={index === 0}
            last={index === items.length - 1}
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
              <Text variant="body" numberOfLines={1}>
                {item.title}
              </Text>
              <Text variant="caption" numberOfLines={1}>
                {item.category} · {formatDate(item.spentOn, false)}
              </Text>
            </View>
            <Text variant="bodyStrong">{formatRupees(item.amount)}</Text>
          </ListCell>
        )}
      />

      <PrimaryAction label="Add expense" icon={icons.add} onPress={() => router.push("/expenses/new")} />
    </View>
  );
}

function StepButton({ label, icon, onPress, disabled }: { label: string; icon: IconName; onPress: () => void; disabled?: boolean }) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      android_ripple={{ color: t.colors.ripple, borderless: true, radius: 20 }}
      style={({ pressed }) => [styles.step, Platform.OS === "ios" && pressed && styles.pressed]}
    >
      <Icon name={icon} size={Platform.OS === "ios" ? 17 : 24} color={disabled ? t.colors.textFaint : t.colors.primary} />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  page: { flex: 1, backgroundColor: t.colors.background },
  header: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: Platform.OS === "ios" ? 0 : spacing.lg,
  },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Platform.OS === "ios" ? t.colors.surface : "transparent",
  },
  pressed: { opacity: 0.6 },
  flex: { flex: 1, gap: 2 },
  totalRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  loading: { marginTop: spacing.xxl * 2 },
}));
