import { FlashList } from "@shopify/flash-list";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import type { StudentStatusFilter } from "@/features/students/api";
import { StudentRow } from "@/features/students/StudentRow";
import { useStudents } from "@/features/students/queries";
import { useDebounced } from "@/lib/useDebounced";
import { useLibrary } from "@/session/CurrentLibrary";
import {
  Chips,
  EmptyView,
  ErrorView,
  LoadingView,
  PrimaryAction,
  Text,
  icons,
  listContentStyle,
  makeStyles,
  spacing,
  useTheme,
} from "@/ui";

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
  const t = useTheme();
  const styles = useStyles();
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

  // Filters scroll with the list, so the iOS large title can collapse over them.
  const header = (
    <View style={styles.header}>
      <Chips scroll options={FILTERS} value={status} onChange={setStatus} />
      {total !== undefined ? (
        <Text variant="label" style={styles.count}>
          {total} student{total === 1 ? "" : "s"}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.page}>
      {/* The system search field: under the large title on iOS, in the app bar on Android. */}
      <Stack.SearchBar
        placeholder="Name or mobile number"
        onChangeText={(e) => setSearch(e.nativeEvent.text)}
        onCancelButtonPress={() => setSearch("")}
        hideWhenScrolling={false}
        autoCapitalize="none"
      />

      {students.isLoading ? (
        <LoadingView />
      ) : students.error && !items.length ? (
        <ErrorView error={students.error} onRetry={() => students.refetch()} />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(s) => String(s.id)}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={listContentStyle}
          keyboardDismissMode="on-drag"
          ListHeaderComponent={header}
          renderItem={({ item, index }) => (
            <StudentRow
              student={item}
              first={index === 0}
              last={index === items.length - 1}
              onPress={() => router.push({ pathname: "/students/[studentId]", params: { studentId: String(item.id) } })}
            />
          )}
          onEndReached={() => {
            if (students.hasNextPage && !students.isFetchingNextPage) void students.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          refreshing={students.isRefetching && !students.isFetchingNextPage}
          onRefresh={() => students.refetch()}
          ListFooterComponent={
            students.isFetchingNextPage ? (
              <ActivityIndicator style={styles.more} color={Platform.OS === "ios" ? undefined : t.colors.primary} />
            ) : null
          }
          ListEmptyComponent={
            <EmptyView
              icon={{ ios: "person.2", android: "group" }}
              title={debounced ? "No one matches that search" : "No students here"}
              message={status === "current" && !debounced ? "Add your first student to get started." : undefined}
            />
          }
        />
      )}

      <PrimaryAction label="Add student" icon={icons.add} onPress={() => router.push("/students/new")} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  page: { flex: 1, backgroundColor: t.colors.background },
  header: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: Platform.OS === "ios" ? 0 : spacing.lg,
  },
  count: { paddingHorizontal: Platform.OS === "ios" ? spacing.lg : 0 },
  more: { marginVertical: spacing.lg },
}));
