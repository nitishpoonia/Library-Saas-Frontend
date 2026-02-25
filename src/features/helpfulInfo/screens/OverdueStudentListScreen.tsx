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
import { useFetchListOfOverdueStudents } from '../helpfulInfoQueries/helpfulInfoQueries';
import { fontFamily } from '../../../constants/fonts';

// Color constants
const PRIMARY = '#4F46E5';
const PRIMARY_LIGHT = '#A5B4FC';
const PRIMARY_MUTED = '#EEF2FF';

type OverdueStudent = {
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

const OverdueStudentListScreen = () => {
  const navigation = useNavigation();
  const { data, isLoading, isFetching, refetch } =
    useFetchListOfOverdueStudents();

  if (isLoading) {
    return (
      <SafeAreaViewContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
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

  const renderStudentCard = ({ item }: { item: OverdueStudent }) => {
    const { student, end_date } = item;
    const initials = getInitials(student.name);

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
            <Text style={styles.footerLabel}>Library ID</Text>
            <Text style={styles.footerValue}>#{student.library_id}</Text>
          </View>
          <View style={styles.footerSeparator} />
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Student ID</Text>
            <Text style={styles.footerValue}>#{student.id}</Text>
          </View>
          <View style={styles.footerSeparator} />
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Due Date</Text>
            <Text style={[styles.footerValue, styles.dueDateText]}>
              {formatDate(end_date)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaViewContainer>
      <FlatList
        data={data?.overdueStudentList}
        renderItem={renderStudentCard}
        keyExtractor={item => item.student.id.toString()}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isFetching}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No overdue students found.</Text>
          </View>
        }
        ListHeaderComponent={
          <Header title="Overdue Students List" navigation={navigation} />
        }
      />
    </SafeAreaViewContainer>
  );
};

export default OverdueStudentListScreen;

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
  dueDateText: {
    color: '#DC2626',
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
