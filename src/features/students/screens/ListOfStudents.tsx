import { View, Text, FlatList, StyleSheet } from 'react-native';
import React from 'react';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import Header from '../../../components/ui/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGetStudents } from '../studentQueries/studentQueries';
import { fontFamily } from '../../../constants/fonts';
const PRIMARY = '#6366F1';
const PRIMARY_LIGHT = '#818CF8';
const PRIMARY_DARK = '#4F46E5';
const PRIMARY_MUTED = '#EEF2FF';
const ListOfStudents = () => {
  const route = useRoute();
  const { libraryId } = route?.params;
  const navigation = useNavigation();
  const { data } = useGetStudents(libraryId);
  const capitalize = str => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const renderStudentCard = ({ item }: { item: any }) => {
    const isActive = item?.membershipStatus === 'active';

    return (
      <View style={styles.card}>
        {/* Header: Name + Status Badge */}
        <View style={styles.header}>
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
              {isActive
                ? capitalize(item?.membershipStatus)
                : item?.membershipStatus}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Expiry Row */}
        <View style={styles.expiryRow}>
          <View style={styles.expiryIconBox}>
            <Text style={styles.expiryIcon}>⏱</Text>
          </View>
          <Text style={styles.expiryLabel}>Expires in</Text>
          <Text style={styles.expiryDays}>{item?.daysRemaining} days</Text>
        </View>

        {/* Info Pills Row */}
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

  console.log('Data', data);
  const ItemSeparator = () => {
    return <View style={{ height: 12 }} />;
  };
  return (
    <SafeAreaViewContainer>
      <Header title="All Students" navigation={navigation} />
      <FlatList
        data={data?.students}
        keyExtractor={item => item._id?.toString()}
        renderItem={renderStudentCard}
        ItemSeparatorComponent={ItemSeparator}
      />
    </SafeAreaViewContainer>
  );
};

export default ListOfStudents;
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
    boxShadow: '0px 8px 20px rgba(79, 70, 229, 0.12)',
  },

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

  /* ── Badge ── */
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
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeDotActive: { backgroundColor: '#10B981' },
  badgeDotInactive: { backgroundColor: '#F59E0B' },
  badgeText: {
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  badgeTextActive: { color: '#065F46' },
  badgeTextInactive: { color: '#92400E' },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 18,
  },

  /* ── Expiry ── */
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

  /* ── Pills ── */
  pillsRow: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_MUTED,
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  pillDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#C7D2FE',
  },
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
});
