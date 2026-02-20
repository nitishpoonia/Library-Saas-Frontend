import React, { useMemo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  View,
  ScrollView,
  Text,
  SectionList,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useListOfExpenses } from '../financeQueries/financeQueries';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import Header from '../../../components/ui/Header';
import { fontFamily } from '../../../constants/fonts';
import { queryClient } from '../../../..';

// ─── Types ───────────────────────────────────────────────────────────────────

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: string | number;
  expense_date: string;
};

type Section = {
  title: string;
  date: string; // raw date key for sorting
  total: number;
  data: Expense[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getDateLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const groupExpensesByDate = (expenses: Expense[]): Section[] => {
  const map: Record<string, Section> = {};

  expenses.forEach(expense => {
    // Use only the date part (YYYY-MM-DD) as the key so time doesn't matter
    const key = expense.expense_date.slice(0, 10);
    const label = getDateLabel(expense.expense_date);

    if (!map[key]) {
      map[key] = { title: label, date: key, total: 0, data: [] };
    }

    map[key].data.push(expense);
    map[key].total += parseFloat(expense.amount.toString());
  });

  // Sort sections: most recent date first
  return Object.values(map).sort((a, b) => (a.date < b.date ? 1 : -1));
};

const formatAmount = (amount: string | number) =>
  `₹${parseFloat(amount.toString()).toLocaleString('en-IN')}`;

// ─── Component ───────────────────────────────────────────────────────────────

const ListAllExpenses = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { libraryId } = route.params;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useListOfExpenses(Number(libraryId), '', '');

  const allExpenses = data?.pages.flatMap(page => page.expenses) ?? [];

  // Memoized so it only recomputes when expenses change
  const sections = useMemo(
    () => groupExpensesByDate(allExpenses),
    [allExpenses],
  );
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        queryClient.removeQueries({
          queryKey: ['expenses', libraryId],
        });
      };
    }, [libraryId]),
  );
  const handleBack = () => navigation.goBack();

  // ── Loading ──
  if (isLoading) {
    return (
      <SafeAreaViewContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      </SafeAreaViewContainer>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <SafeAreaViewContainer>
        <View style={styles.centerContainer}>
          <FontAwesome6
            iconStyle="solid"
            name="circle-exclamation"
            size={64}
            color="#ef4444"
          />
          <Text style={styles.errorTitle}>Failed to Load Expenses</Text>
          <Text style={styles.errorMessage}>
            {error?.message || 'Something went wrong. Please try again.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaViewContainer>
    );
  }

  // ── Empty ──
  if (allExpenses.length === 0) {
    return (
      <SafeAreaViewContainer>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          <Header title="All Expenses" navigation={navigation} />
          <View style={styles.emptyContainer}>
            <FontAwesome6
              iconStyle="solid"
              name="file-invoice-dollar"
              size={64}
              color="#9ca3af"
            />
            <Text style={styles.emptyTitle}>No Expenses Yet</Text>
            <Text style={styles.emptyMessage}>
              Start tracking your expenses by adding your first expense.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaViewContainer>
    );
  }

  // ── Render ──
  const renderExpenseCard = ({ item }: { item: Expense }) => {
    console.log('Item', item);

    return (
      <View style={styles.expenseCard}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseIcon}>
            <FontAwesome6
              iconStyle="solid"
              name="file-invoice"
              size={20}
              color="#3b82f6"
            />
          </View>

          <View style={styles.expenseInfo}>
            <Text style={styles.expenseTitle}>{item.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>

          <View style={styles.expenseAmount}>
            <Text style={styles.amountText}>{formatAmount(item.amount)}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Sticky date header with daily total
  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <FontAwesome6
          iconStyle="solid"
          name="calendar-days"
          size={13}
          color="#3b82f6"
        />
        <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
      </View>
      <Text style={styles.sectionHeaderTotal}>
        {formatAmount(section.total.toFixed(2))}
      </Text>
    </View>
  );

  const listHeader = () => (
    <>
      <Header title="All Expenses" navigation={navigation} />
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryValue}>{allExpenses.length}</Text>
      </View>
    </>
  );

  return (
    <SafeAreaViewContainer>
      <View style={styles.listContainer}>
        <SectionList
          sections={sections}
          keyExtractor={item => item.id.toString()}
          renderItem={renderExpenseCard}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={listHeader}
          stickySectionHeadersEnabled={true}
          onRefresh={refetch}
          refreshing={isFetching}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={20}
          windowSize={40}
          contentContainerStyle={styles.sectionListContent}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
        />
      </View>
    </SafeAreaViewContainer>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.medium,
    opacity: 0.7,
    color: '#000',
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    marginTop: 16,
    color: '#000',
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.regular,
    opacity: 0.7,
    textAlign: 'center',
    color: '#000',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 32,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
  },
  backButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 32,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: '#000',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    marginTop: 16,
    color: '#000',
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.regular,
    opacity: 0.7,
    textAlign: 'center',
    color: '#000',
  },
  summaryCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.medium,
    opacity: 0.7,
    color: '#000',
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#3b82f6',
  },
  listContainer: {
    flex: 1,
  },
  sectionListContent: {
    paddingBottom: 24,
  },
  // ── Section header (sticky date row) ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    marginBottom: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: '#1d4ed8',
  },
  sectionHeaderTotal: {
    fontSize: 13,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#1d4ed8',
  },
  // ── Expense card ──
  expenseCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginBottom: 8,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
    gap: 6,
  },
  expenseTitle: {
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: '#000',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: fontFamily.MONTSERRAT.medium,
    opacity: 0.8,
    color: '#000',
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#ef4444',
  },
});

export default ListAllExpenses;
