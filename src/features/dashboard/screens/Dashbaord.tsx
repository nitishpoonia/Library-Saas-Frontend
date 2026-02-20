import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import { fontFamily } from '../../../constants/fonts';
import InfoCard from '../../../components/ui/InfoCard';
import {
  useGetAllLibraries,
  useGetDashboardOverview,
} from '../dashboardQueries/dashboardQuery';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNotificationService } from '../../../services/notificationService';

const Dashboard: React.FC = () => {
  const { data: libraryData, isLoading: isLibraryIdLoading } =
    useGetAllLibraries();
  const libraryId = libraryData?.libraries[0]?.id;
  const {
    data: dashboardData,
    isLoading,
    isFetching,
    refetch: refetchDashboard,
  } = useGetDashboardOverview(libraryId);
  useNotificationService();

  const navigation = useNavigation();

  const formatCurrency = (amount: number): string => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const libraryName = dashboardData?.libraryName;
  const subscriptionStatus = dashboardData?.dashboard?.subscription.status;
  const daysLeftInSubscription =
    dashboardData?.dashboard?.subscription.daysRemaining;
  const balance = dashboardData?.dashboard?.finance?.balance;
  const revenue = dashboardData?.dashboard?.finance?.revenue;
  const expenses = dashboardData?.dashboard?.finance?.expenses;
  const occupiedSeats = dashboardData?.dashboard?.seats.occupied;
  const totalSeats = dashboardData?.dashboard?.seats.total;
  const activeStudents = dashboardData?.dashboard?.students.active;
  const occupancyRate =
    totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  if (isLoading || isLibraryIdLoading) {
    return (
      <SafeAreaViewContainer>
        <LoadingScreen
          isLibraryIdLoading={isLibraryIdLoading}
          isLoading={isLoading}
        />
      </SafeAreaViewContainer>
    );
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={async () => await refetchDashboard()}
            tintColor="#3b82f6"
            title="Fetching New data"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{libraryName}</Text>

          <Text style={styles.headerSubtitle}>
            {subscriptionStatus === 'trial' ? 'Trial Period' : 'Active'} •{' '}
            {daysLeftInSubscription} days remaining
          </Text>
        </View>

        {/* Finance Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Finance Overview</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                navigation.navigate('Finance', {
                  screen: 'AddExpense',
                  params: {
                    libraryId: libraryId,
                  },
                })
              }
            >
              <Text style={styles.addButtonText}>+ Add Expense</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardsContainer}>
            <InfoCard
              title="Current Balance"
              value={formatCurrency(balance)}
              subtitle={balance < 0 ? 'Outstanding dues' : 'Available funds'}
              variant="default"
              valueColor={balance < 0 ? '#ef4444' : '#10b981'}
            />
            <View style={styles.rowCards}>
              <InfoCard
                title="Revenue"
                value={formatCurrency(revenue)}
                variant="outlined"
                borderColor="#10b981"
                style={styles.halfCard}
              />
              <InfoCard
                title="Expenses"
                value={formatCurrency(expenses)}
                variant="outlined"
                borderColor="#f59e0b"
                style={styles.halfCard}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() =>
              navigation.navigate('Finance', {
                screen: 'ViewAllExpenses',
                params: {
                  libraryId: libraryId,
                },
              })
            }
          >
            <Text style={styles.linkButtonText}>View List of Expenses</Text>
            <FontAwesome6
              name="arrow-right"
              iconStyle="solid"
              color="#3b82f6"
            />
          </TouchableOpacity>
        </View>

        {/* Students */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Students</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                navigation.navigate('Student', {
                  screen: 'AddStudent',
                  params: {
                    libraryId: libraryId,
                  },
                })
              }
            >
              <Text style={styles.primaryButtonText}>+ Add Student</Text>
            </TouchableOpacity>
          </View>

          <InfoCard
            title="Active Students"
            value={activeStudents?.toString()}
            subtitle="Currently enrolled"
            variant="default"
          />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() =>
              navigation.navigate('Student', {
                screen: 'ViewListOfStudents',
                params: {
                  libraryId: libraryId,
                },
              })
            }
          >
            <Text style={styles.linkButtonText}>View List of Students</Text>
            <FontAwesome6
              name="arrow-right"
              iconStyle="solid"
              color="#3b82f6"
            />
          </TouchableOpacity>
        </View>

        {/* Seats & Occupancy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seats & Occupancy</Text>

          <View style={styles.cardsContainer}>
            <InfoCard
              title="Seat Utilization"
              value={`${occupiedSeats}/${totalSeats}`}
              subtitle={`${occupancyRate}% occupied`}
              variant="default"
            />
            <View style={styles.rowCards}>
              <InfoCard
                title="Occupied"
                value={occupiedSeats?.toString()}
                variant="outlined"
                borderColor="#3b82f6"
                style={styles.halfCard}
              />
              <InfoCard
                title="Available"
                value={(totalSeats - occupiedSeats)?.toString()}
                variant="outlined"
                borderColor="#8b5cf6"
                style={styles.halfCard}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};

interface Styles {
  container: ViewStyle;
  scrollView: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  section: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  cardsContainer: ViewStyle;
  rowCards: ViewStyle;
  halfCard: ViewStyle;
  addButton: ViewStyle;
  addButtonText: TextStyle;
  primaryButton: ViewStyle;
  primaryButtonText: TextStyle;
  linkButton: ViewStyle;
  linkButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },

  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.medium,

    color: '#6b7280',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fontFamily.MONTSERRAT.bold,

    color: '#1f2937',
  },
  cardsContainer: {
    gap: 12,
  },
  rowCards: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },

  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.bold,
  },
  primaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  primaryButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.bold,
  },
  linkButton: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  linkButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
  },
});

export default Dashboard;
