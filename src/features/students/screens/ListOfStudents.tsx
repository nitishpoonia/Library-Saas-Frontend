import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import Header from '../../../components/ui/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGetStudents } from '../studentQueries/studentQueries';
import { fontFamily } from '../../../constants/fonts';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { FlashList } from '@shopify/flash-list';

const PRIMARY = '#6366F1';
const PRIMARY_LIGHT = '#818CF8';
const PRIMARY_DARK = '#4F46E5';
const PRIMARY_MUTED = '#EEF2FF';

const ListOfStudents = () => {
  const route = useRoute();
  const { libraryId } = route?.params;
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [isDebouncing, setIsDebouncing] = React.useState(false);
  const navigation = useNavigation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
    isFetching,
  } = useGetStudents(Number(libraryId), debouncedSearch);

  React.useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setIsDebouncing(false);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const allStudents = React.useMemo(() => {
    return data?.pages?.flatMap(page => page.students ?? []) ?? [];
  }, [data]);

  const isSearching = isFetching && !isFetchingNextPage && !isRefetching;

  const handleClearSearch = () => setSearch('');

  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const ItemSeparator = () => <View style={{ height: 12 }} />;

  const renderStudentCard = ({ item }: { item: any }) => {
    const isActive = item?.membershipStatus === 'active';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {item?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item?.name}</Text>
            <Text style={styles.phone}>{item?.phone}</Text>
          </View>
          <View
            style={[
              styles.badge,
              isActive ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <View
              style={[
                styles.badgeDot,
                isActive ? styles.badgeDotActive : styles.badgeDotInactive,
              ]}
            />
            <Text
              style={[
                styles.badgeText,
                isActive ? styles.badgeTextActive : styles.badgeTextInactive,
              ]}
            >
              {capitalize(item?.membershipStatus)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.expiryRow}>
          <View style={styles.expiryIconBox}>
            <Text style={styles.expiryIcon}>⏱</Text>
          </View>
          <Text style={styles.expiryLabel}>Expires in</Text>
          <Text style={styles.expiryDays}>{item?.daysRemaining} days</Text>
        </View>

        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>ID</Text>
            <Text style={styles.pillValue}>{item?.studentId}</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>Seat</Text>
            <Text style={styles.pillValue}>{item?.seatNumber}</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>Timing</Text>
            <Text style={styles.pillValue}>{item?.timing}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyList = () => {
    if (isLoading || isSearching || isDebouncing) return null;
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome6
          iconStyle="solid"
          name={search ? 'magnifying-glass' : 'file-invoice-dollar'}
          size={56}
          color="#9ca3af"
        />
        <Text style={styles.emptyTitle}>
          {search ? 'No results found' : 'No Students Yet'}
        </Text>
        <Text style={styles.emptyMessage}>
          {search
            ? `No students match "${search}". Try a different name or phone number.`
            : 'Start managing students by adding your first student.'}
        </Text>
        {search ? (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear search</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  if (isLoading && allStudents.length === 0 && !search) {
    return (
      <SafeAreaViewContainer>
        <Header title="All Students" navigation={navigation} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading Students…</Text>
        </View>
      </SafeAreaViewContainer>
    );
  }

  return (
    <SafeAreaViewContainer>
      <Header title="All Students" navigation={navigation} />

      <View
        style={[
          styles.searchContainer,
          search.length > 0 && styles.searchContainerActive,
        ]}
      >
        {isDebouncing || isSearching ? (
          <ActivityIndicator size="small" color={PRIMARY} />
        ) : (
          <FontAwesome6
            name="magnifying-glass"
            iconStyle="solid"
            size={15}
            color={search ? PRIMARY : '#6b7280'}
          />
        )}
        <TextInput
          placeholder="Search by name or phone…"
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FontAwesome6
              name="circle-xmark"
              iconStyle="solid"
              size={16}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}
      </View>

      {!isDebouncing && !isSearching && debouncedSearch.length > 0 && (
        <Text style={styles.resultCount}>
          {allStudents.length === 0
            ? 'No results'
            : `${allStudents.length} student${
                allStudents.length !== 1 ? 's' : ''
              } found`}
        </Text>
      )}

      <FlashList
        data={allStudents}
        renderItem={renderStudentCard}
        keyExtractor={item => item.studentId.toString()}
        estimatedItemSize={180}
        ItemSeparatorComponent={ItemSeparator}
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color={PRIMARY} />
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        extraData={debouncedSearch}
      />
    </SafeAreaViewContainer>
  );
};

export default ListOfStudents;

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
  searchContainer: {
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainerActive: {
    borderColor: PRIMARY_LIGHT,
    backgroundColor: PRIMARY_MUTED,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.medium,
    color: '#000',
  },
  resultCount: {
    fontSize: 12,
    fontFamily: fontFamily.MONTSERRAT.medium,
    color: '#6b7280',
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0px 8px 20px rgba(79, 70, 229, 0.12)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PRIMARY_MUTED,
    borderWidth: 2,
    borderColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.MONTSERRAT.bold,
    fontSize: 18,
    color: PRIMARY,
  },
  headerInfo: { flex: 1 },
  name: {
    fontFamily: fontFamily.MONTSERRAT.bold,
    fontSize: 16,
    color: '#1E1B4B',
    letterSpacing: 0.2,
  },
  phone: {
    fontFamily: fontFamily.MONTSERRAT.regular,
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  badgeActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  badgeInactive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeDotActive: { backgroundColor: '#10B981' },
  badgeDotInactive: { backgroundColor: '#F59E0B' },
  badgeText: {
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  badgeTextActive: { color: '#065F46' },
  badgeTextInactive: { color: '#92400E' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 18 },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 8,
  },
  expiryIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: PRIMARY_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiryIcon: { fontSize: 14 },
  expiryLabel: {
    fontFamily: fontFamily.MONTSERRAT.medium,
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  expiryDays: {
    fontFamily: fontFamily.MONTSERRAT.bold,
    fontSize: 14,
    color: PRIMARY,
    letterSpacing: 0.3,
  },
  pillsRow: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_MUTED,
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  pill: { flex: 1, alignItems: 'center', gap: 3 },
  pillDivider: { width: 1, height: 32, backgroundColor: '#C7D2FE' },
  pillLabel: {
    fontFamily: fontFamily.MONTSERRAT.medium,
    fontSize: 10,
    color: PRIMARY_LIGHT,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pillValue: {
    fontFamily: fontFamily.MONTSERRAT.bold,
    fontSize: 13,
    color: PRIMARY_DARK,
    letterSpacing: 0.2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
    paddingHorizontal: 32,
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
  clearButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: PRIMARY_MUTED,
    borderWidth: 1,
    borderColor: PRIMARY_LIGHT,
  },
  clearButtonText: {
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    fontSize: 13,
    color: PRIMARY,
  },
});
