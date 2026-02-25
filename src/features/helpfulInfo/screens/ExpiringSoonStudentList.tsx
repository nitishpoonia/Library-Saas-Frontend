import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import React from 'react';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import Header from '../../../components/ui/Header';
import { useNavigation } from '@react-navigation/native';
import { useFetchListOfExpiringSoon } from '../helpfulInfoQueries/helpfulInfoQueries';
import { fontFamily } from '../../../constants/fonts';

// Color constants
const PRIMARY = '#D97706'; // amber instead of indigo — "expiring soon" warning tone
const PRIMARY_LIGHT = '#FDE68A';
const PRIMARY_MUTED = '#FFFBEB';

type ExpiringSoonStudent = {
  end_date: string;
  student: {
    id: number;
    library_id: number;
    name: string;
    phone: string;
    isActive: boolean;
    created_at: string;
    updated_at: string;
  };
};

const getDaysLeft = (dateString: string): number => {
  const now = new Date();
  const end = new Date(dateString);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getDaysLeftLabel = (days: number): string => {
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

const getDaysLeftColor = (days: number): string => {
  if (days <= 0) return '#DC2626'; // red
  if (days <= 2) return '#EA580C'; // orange-red
  if (days <= 4) return '#D97706'; // amber
  return '#65A30D'; // green-ish for 5+ days
};

const ExpiringSoonStudentListScreen = () => {
  const navigation = useNavigation();
  const { data, isLoading, isFetching, refetch } = useFetchListOfExpiringSoon();

  if (isLoading) {
    return (
      <SafeAreaViewContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Loading List...</Text>
        </View>
      </SafeAreaViewContainer>
    );
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderStudentCard = ({ item }: { item: ExpiringSoonStudent }) => {
    const { student, end_date } = item;
    const initials = getInitials(student.name);
    const daysLeft = getDaysLeft(end_date);
    const daysLabel = getDaysLeftLabel(daysLeft);
    const daysColor = getDaysLeftColor(daysLeft);

    return (
      <View style={styles.card}>
        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.phone}>{student.phone}</Text>
          </View>
          {/* Active / Inactive Badge */}
          <View
            style={[
              styles.badge,
              student.isActive ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                student.isActive
                  ? styles.badgeTextActive
                  : styles.badgeTextInactive,
              ]}
            >
              {student.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer Row */}
        <View style={styles.footer}>
         
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Student ID</Text>
            <Text style={styles.footerValue}>#{student.id}</Text>
          </View>
          <View style={styles.footerSeparator} />
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Expires On</Text>
            <Text style={styles.footerValue}>{formatDate(end_date)}</Text>
          </View>
          <View style={styles.footerSeparator} />
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Remaining</Text>
            <Text style={[styles.footerValue, { color: daysColor }]}>
              {daysLabel}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaViewContainer>
      <FlatList
        data={data?.expiringSoonList}
        renderItem={renderStudentCard}
        keyExtractor={item => item.student.id.toString()}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isFetching}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Header title="Expiring Soon" navigation={navigation} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expiring students found.</Text>
          </View>
        }
      />
    </SafeAreaViewContainer>
  );
};

export default ExpiringSoonStudentListScreen;

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
  listContent: {},

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: 'rgba(217, 119, 6, 1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },

  // Header
  header: {
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
  headerInfo: {
    flex: 1,
  },
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

  // Badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: '#D1FAE5',
  },
  badgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
  badgeTextActive: {
    color: '#065F46',
  },
  badgeTextInactive: {
    color: '#991B1B',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 18,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  footerLabel: {
    fontSize: 10,
    fontFamily: fontFamily.MONTSERRAT.medium,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  footerValue: {
    fontSize: 13,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#1E1B4B',
  },
  footerSeparator: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: fontFamily.MONTSERRAT.medium,
    fontSize: 15,
    color: '#9CA3AF',
  },
});
