import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Text,
  TextInput,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
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
import ExpenseCard from '../financeComponents/ExpenseCard';

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: string | number;
  expense_date: string;
};
const PRIMARY = '#6366F1';
const PRIMARY_LIGHT = '#818CF8';
const PRIMARY_DARK = '#4F46E5';
const PRIMARY_MUTED = '#EEF2FF';
const ListAllExpenses = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { libraryId } = route.params as { libraryId: number };

  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [isDebouncing, setIsDebouncing] = React.useState(false);

  React.useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    setIsDebouncing(false);

    return () => clearTimeout(handler);
  }, [search]);

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
    isRefetching,
  } = useListOfExpenses(Number(libraryId), debouncedSearch, '');

  const allExpenses = useMemo(() => {
    return data?.pages?.flatMap(page => page.expenses) ?? [];
  }, [data]);
  const isSearching = isFetching && !isFetchingNextPage && !isRefetching;

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        queryClient.removeQueries({
          queryKey: ['expenses', libraryId],
        });
      };
    }, [libraryId]),
  );

  const renderExpenseCard = useCallback(({ item }: { item: Expense }) => {
    return <ExpenseCard item={item} />;
  }, []);

  const handleBack = () => navigation.goBack();

  if (isLoading && !search) {
    return (
      <SafeAreaViewContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      </SafeAreaViewContainer>
    );
  }

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

  const renderEmptyComponent = () => {
    if (isFetching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <FontAwesome6
          iconStyle="solid"
          name="file-invoice-dollar"
          size={64}
          color="#9ca3af"
        />
        <Text style={styles.emptyTitle}>
          {search ? 'No Results Found' : 'No Expenses Yet'}
        </Text>
        <Text style={styles.emptyMessage}>
          {search
            ? `No expenses match "${search}".`
            : 'Start tracking your expenses by adding your first expense.'}
        </Text>
      </View>
    );
  };

  const listHeader = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>Total Expenses</Text>
      <Text style={styles.summaryValue}>{allExpenses.length}</Text>
    </View>
  );

  return (
    <SafeAreaViewContainer>
      <Header title="All Expenses" navigation={navigation} />

      <View
        style={[
          styles.searchContainer,
          search.length > 0 && styles.searchContainerActive,
        ]}
      >
        <FontAwesome6
          name="magnifying-glass"
          iconStyle="solid"
          size={16}
          color="#6b7280"
        />
        <TextInput
          placeholder="Search expenses..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>
      {!isDebouncing && !isSearching && debouncedSearch.length > 0 && (
        <Text style={styles.resultCount}>
          {allExpenses.length === 0
            ? 'No results'
            : `${allExpenses.length} expense${
                allExpenses.length !== 1 ? 's' : ''
              } found`}
        </Text>
      )}
      <View style={styles.listContainer}>
        <FlashList
          data={allExpenses}
          renderItem={renderExpenseCard}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={renderEmptyComponent}
          onRefresh={refetch}
          refreshing={isRefetching}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sectionListContent}
        />
      </View>
    </SafeAreaViewContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.medium,
    color: '#000',
  },
  searchContainerActive: {
    borderColor: PRIMARY_LIGHT,
    backgroundColor: PRIMARY_MUTED,
  },
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
  resultCount: {
    fontSize: 12,
    fontFamily: fontFamily.MONTSERRAT.medium,
    color: '#6b7280',
    marginBottom: 10,
    marginLeft: 4,
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
});

export default ListAllExpenses;
