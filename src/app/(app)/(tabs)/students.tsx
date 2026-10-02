import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { StudentStatusFilter } from "@/features/students/api";
import { StudentCard } from "@/features/students/StudentCard";
import { useStudents } from "@/features/students/queries";
import { useDebounced } from "@/lib/useDebounced";
import { useLibrary } from "@/session/CurrentLibrary";
import { Chips, EmptyView, ErrorView, LoadingView, Text, TextField, colors, spacing } from "@/ui";

const FILTERS: Array<{ value: StudentStatusFilter; label: string }> = [
  { value: "current", label: "Current" },
  // Started and not overdue; Home's "Active students" card opens this.
  { value: "active", label: "Active" },
  { value: "overdue", label: "Overdue" },
  { value: "pending", label: "Fees pending" },
  { value: "expiring", label: "Ending soon" },
  { value: "inactive", label: "No seat" },
  { value: "archived", label: "Removed" },
];

export default function StudentsScreen() {
  const library = useLibrary();
  const params = useLocalSearchParams<{ status?: StudentStatusFilter; at?: string }>();
  const [status, setStatus] = useState<StudentStatusFilter>(params.status ?? "current");
  // Home's cards open this tab with a filter, even when the tab is already open.
  // `at` changes on every tap, so tapping the same card again re-applies its filter
  // after the user picked another chip.
  useEffect(() => {
    if (params.status) setStatus(params.status);
  }, [params.status, params.at]);
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search.trim());

  const students = useStudents(library.id, status, debounced);
  const items = students.data?.pages.flatMap((p) => p.items) ?? [];
  const total = students.data?.pages[0]?.meta.total;

  return (
    <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="title">Students</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add student"
            onPress={() => router.push("/students/new")}
            style={styles.addButton}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text variant="bodyStrong" color="#FFFFFF">
              Add
            </Text>
          </Pressable>
        </View>
        <TextField placeholder="Search by name or mobile" value={search} onChangeText={setSearch} autoCorrect={false} />
        <Chips scroll options={FILTERS} value={status} onChange={setStatus} />
        {total !== undefined ? <Text variant="caption">{total} student{total === 1 ? "" : "s"}</Text> : null}
      </View>

      {students.isLoading ? (
        <LoadingView />
      ) : students.error && !items.length ? (
        <ErrorView error={students.error} onRetry={() => students.refetch()} />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(s) => String(s.id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => (
            <StudentCard
              student={item}
              onPress={() => router.push({ pathname: "/students/[studentId]", params: { studentId: String(item.id) } })}
            />
          )}
          onEndReached={() => {
            if (students.hasNextPage && !students.isFetchingNextPage) void students.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          refreshing={students.isRefetching && !students.isFetchingNextPage}
          onRefresh={() => students.refetch()}
          ListFooterComponent={students.isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : null}
          ListEmptyComponent={
            <EmptyView
              title={debounced ? "No one matches that search" : "No students here"}
              message={status === "current" && !debounced ? "Add your first student to get started." : undefined}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  list: { padding: spacing.lg },
});
