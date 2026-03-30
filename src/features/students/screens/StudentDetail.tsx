import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import Header from '../../../components/ui/Header';
import { fontFamily } from '../../../constants/fonts';
import { useGetStudentDetail } from '../studentQueries/studentQueries';

const PRIMARY = '#6366F1';
const PRIMARY_MUTED = '#EEF2FF';

type StudentDetailRouteParams = {
  libraryId: number;
  studentId: number;
};

const StudentDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { libraryId, studentId } = route.params as StudentDetailRouteParams;

  const { data, isLoading, isRefetching, refetch, error } = useGetStudentDetail(
    Number(libraryId),
    Number(studentId),
  );

  const student = data?.student;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount?: number) =>
    `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;

  if (isLoading) {
    return (
      <SafeAreaViewContainer>
        <Header title="Student Details" navigation={navigation} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading student details...</Text>
        </View>
      </SafeAreaViewContainer>
    );
  }

  if (error || !student) {
    return (
      <SafeAreaViewContainer>
        <Header title="Student Details" navigation={navigation} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Could not load student details</Text>
          <Text style={styles.errorMessage}>
            {error instanceof Error
              ? error.message
              : 'Failed to fetch student details'}
          </Text>
        </View>
      </SafeAreaViewContainer>
    );
  }

  return (
    <SafeAreaViewContainer>
      <Header title="Student Details" navigation={navigation} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentPhone}>{student.phone}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                student.isActive ? styles.activeBadge : styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  student.isActive ? styles.activeText : styles.inactiveText,
                ]}
              >
                {student.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created</Text>
            <Text style={styles.metaValue}>
              {formatDate(student.createdAt)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Updated</Text>
            <Text style={styles.metaValue}>
              {formatDate(student.updatedAt)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Membership History</Text>

        {student.memberships?.length ? (
          student.memberships.map(membership => (
            <View key={membership.membershipId} style={styles.membershipCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.membershipId}>
                  Membership #{membership.membershipId}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    membership.status === 'active'
                      ? styles.activeBadge
                      : styles.inactiveBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      membership.status === 'active'
                        ? styles.activeText
                        : styles.inactiveText,
                    ]}
                  >
                    {membership.status}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Period</Text>
                <Text style={styles.metaValue}>
                  {formatDate(membership.startDate)} -{' '}
                  {formatDate(membership.endDate)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Timing</Text>
                <Text style={styles.metaValue}>{membership.timing || '-'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Seat</Text>
                <Text style={styles.metaValue}>
                  {membership.seat?.seatNumber || '-'}
                  {membership.seat?.hasLocker ? ' (Locker)' : ''}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Days Remaining</Text>
                <Text style={styles.metaValue}>
                  {membership.daysRemaining ?? 0}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Total Fee</Text>
                <Text style={styles.metaValue}>
                  {formatAmount(membership.totalFee)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Paid</Text>
                <Text style={styles.metaValue}>
                  {formatAmount(membership.paidAmount)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Pending</Text>
                <Text style={styles.metaValue}>
                  {formatAmount(membership.pendingAmount)}
                </Text>
              </View>

              <Text style={styles.paymentsTitle}>Payments</Text>

              {membership.payments?.length ? (
                membership.payments.map(payment => (
                  <View key={payment.paymentId} style={styles.paymentCard}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Receipt</Text>
                      <Text style={styles.metaValue}>
                        {payment.receiptNumber || '-'}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Amount</Text>
                      <Text style={styles.metaValue}>
                        {formatAmount(payment.amount)}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Mode</Text>
                      <Text style={styles.metaValue}>
                        {payment.paymentMode || '-'}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Date</Text>
                      <Text style={styles.metaValue}>
                        {formatDate(payment.paymentDate)}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Notes</Text>
                      <Text style={styles.metaValue}>
                        {payment.notes || '-'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No payments found for this membership.
                </Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyText}>No memberships available.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaViewContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#4B5563',
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
  errorTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: fontFamily.MONTSERRAT.bold,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  studentName: {
    fontSize: 20,
    color: '#111827',
    fontFamily: fontFamily.MONTSERRAT.bold,
  },
  studentPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  inactiveBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
    fontFamily: fontFamily.MONTSERRAT.semiBold,
  },
  activeText: {
    color: '#065F46',
  },
  inactiveText: {
    color: '#92400E',
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  metaLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
  metaValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: '#111827',
    fontFamily: fontFamily.MONTSERRAT.semiBold,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 10,
    fontFamily: fontFamily.MONTSERRAT.bold,
  },
  membershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  membershipId: {
    fontSize: 14,
    color: '#111827',
    fontFamily: fontFamily.MONTSERRAT.bold,
  },
  paymentsTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 14,
    color: PRIMARY,
    fontFamily: fontFamily.MONTSERRAT.bold,
  },
  paymentCard: {
    backgroundColor: PRIMARY_MUTED,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
});

export default StudentDetail;
