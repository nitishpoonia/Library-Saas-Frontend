import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  BackHandler,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { queryClient } from '../../../../index';

import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import {
  useAddStudent,
  useGetAvailableSeats,
} from '../studentQueries/studentQueries';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Header from '../../../components/ui/Header';
import { fontFamily } from '../../../constants/fonts';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import useKeyboardVisible from '../../../components/layout/useKeyboardHook';
import Toast from 'react-native-toast-message';

type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Bank Transfer';

// Debounce hook
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AddStudentScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const route = useRoute();
  const { libraryId } = route.params;
  const { mutate: addStudent, isPending } = useAddStudent();
  const isKeyboardVisible = useKeyboardVisible();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  const now = new Date();

  const [startTime, setStartTime] = useState(now);

  const [endTime, setEndTime] = useState(
    new Date(now.getTime() + 2 * 60 * 60 * 1000),
  );
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [bookedFor, setBookedFor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amount, setAmount] = useState('');
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Debounced values
  const debouncedStartTime = useDebounce(startTime, 3000);
  const debouncedEndTime = useDebounce(endTime, 3000);
  const debouncedBookedFor = useDebounce(bookedFor, 3000);

  const paymentMethods: PaymentMethod[] = [
    'Cash',
    'Card',
    'UPI',
    'Bank Transfer',
  ];

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getTimingString = () => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const toTimeString = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  // Check if we should fetch seats
  const shouldFetchSeats =
    debouncedBookedFor &&
    parseInt(debouncedBookedFor) > 0 &&
    debouncedStartTime &&
    debouncedEndTime;

  const dataForGettingAvailableSeats = shouldFetchSeats
    ? {
        startTime: toTimeString(debouncedStartTime),
        endTime: toTimeString(debouncedEndTime),
        bookedFor: Number(debouncedBookedFor),
      }
    : null;

  const { data: availableSeatsData, isFetching } = useGetAvailableSeats({
    libraryId,
    dataForGettingAvailableSeats,
  });

  const availableSeats = availableSeatsData?.data?.availableSeats || [];

  // Check if user is actively typing (debounce in progress)
  const isDebouncing =
    bookedFor !== debouncedBookedFor ||
    formatTime(startTime) !== formatTime(debouncedStartTime) ||
    formatTime(endTime) !== formatTime(debouncedEndTime);

  // Add a new derived value:
  const hasEnoughDataToFetch =
    debouncedBookedFor &&
    parseInt(debouncedBookedFor) > 0 &&
    debouncedStartTime &&
    debouncedEndTime;
  const showSeatSection = isDebouncing || hasEnoughDataToFetch;

  const resetForm = () => {
    setName('');
    setPhone('');
    setSelectedSeatId(null);
    setStartTime(new Date());
    setEndTime(new Date());
    setBookedFor('');
    setPaymentMethod('Cash');
    setAmount('');
    setShowPaymentDropdown(false);
    setIsDirty(false);
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter student name');
      return false;
    }
    if (phone.length !== 10) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid 10-digit phone number',
      );
      return false;
    }
    if (!selectedSeatId) {
      Alert.alert('Validation Error', 'Please select a seat');
      return false;
    }
    if (!bookedFor || parseInt(bookedFor) <= 0) {
      Alert.alert('Validation Error', 'Please enter valid number of days');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Validation Error', 'Please enter valid amount');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const selectedSeat = availableSeats.find(
      (seat: any) => seat.id === selectedSeatId,
    );

    const studentData = {
      name,
      phone,
      seat_number: selectedSeat?.seat_number || '',
      timing: getTimingString(),
      booked_for: parseInt(bookedFor),
      payment_method: paymentMethod,
      amount,
      library_id: Number(libraryId),
    };

    console.log('Student Data:', studentData);
    addStudent(studentData, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Student added successfully',
        });
        queryClient.invalidateQueries({
          queryKey: ['dashboardOverview'],
        });
      },
      onError: (error: any) => {
        console.error('Error adding student:', error.message);
        Alert.alert('Error', error.message, [
          {
            text: 'OK',
          },
        ]);
      },
    });
  };

  const handleCancel = () => {
    if (!isDirty) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Discard changes?',
      'You have unsaved changes. Are you sure you want to discard them?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            resetForm();
            navigation.goBack();
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (!isDirty) {
            return false;
          }

          Alert.alert(
            'Discard changes?',
            'You have unsaved changes. Are you sure you want to discard them?',
            [
              {
                text: 'No',
                style: 'cancel',
              },
              {
                text: 'Yes',
                style: 'destructive',
                onPress: () => {
                  resetForm();
                  navigation.goBack();
                },
              },
            ],
          );

          return true;
        },
      );

      return () => {
        subscription.remove();
      };
    }, [isDirty]),
  );

  return (
    <SafeAreaViewContainer>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: isKeyboardVisible ? tabBarHeight - 40 : tabBarHeight,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          title="Add New Student"
          navigation={navigation}
          disabled={isPending}
        />

        {/* Form */}
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Student Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={v => {
                setName(v);
                setIsDirty(true);
              }}
              placeholder="Enter student name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={v => {
                setPhone(v);
                setIsDirty(true);
              }}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Timing */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Timing *</Text>
            <View style={styles.timeContainer}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  Start: {formatTime(startTime)}
                </Text>
              </TouchableOpacity>

              <Text style={styles.timeSeparator}>to</Text>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  End: {formatTime(endTime)}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                // is24Hour
                onChange={(_, date) => {
                  setShowStartTimePicker(false);
                  if (date) {
                    setStartTime(date);
                    setIsDirty(true);
                  }
                }}
              />
            )}

            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                // is24Hour
                onChange={(_, date) => {
                  setShowEndTimePicker(false);
                  if (date) {
                    setEndTime(date);
                    setIsDirty(true);
                  }
                }}
              />
            )}
          </View>

          {/* Booked For */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Booked For (Days) *</Text>
            <TextInput
              style={styles.input}
              value={bookedFor}
              onChangeText={v => {
                setBookedFor(v);
                setIsDirty(true);
              }}
              keyboardType="numeric"
              placeholder="Enter number of days"
              placeholderTextColor="#999"
            />
          </View>

          {/* Seat Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Seat *</Text>

            {/* Show message if fields not filled */}
            {!showSeatSection && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>
                  Please enter timing and duration to see available seats
                </Text>
              </View>
            )}

            {/* Show debouncing indicator */}
            {isDebouncing && (
              <View style={styles.messageContainer}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.messageText}>
                  Searching for available seats...
                </Text>
              </View>
            )}

            {/* Show loading spinner while fetching */}
            {!isDebouncing && isFetching && hasEnoughDataToFetch && (
              <View style={styles.messageContainer}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.loadingText}>
                  Loading available seats...
                </Text>
              </View>
            )}

            {/* Show seats list */}
            {!isFetching &&
              !isDebouncing &&
              hasEnoughDataToFetch &&
              availableSeats.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.seatsScrollView}
                  contentContainerStyle={styles.seatsContainer}
                >
                  {availableSeats.map((seat: any) => (
                    <TouchableOpacity
                      key={seat.id}
                      style={[
                        styles.seatCard,
                        selectedSeatId === seat.id && styles.seatCardSelected,
                      ]}
                      onPress={() => {
                        setSelectedSeatId(seat.id);
                        setIsDirty(true);
                      }}
                    >
                      <Text
                        style={[
                          styles.seatNumber,
                          selectedSeatId === seat.id &&
                            styles.seatNumberSelected,
                        ]}
                      >
                        {seat.seat_number}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

            {/* Show no seats available message */}
            {!isFetching &&
              !isDebouncing &&
              shouldFetchSeats &&
              availableSeats.length === 0 && (
                <View style={styles.messageContainer}>
                  <Text style={[styles.messageText, styles.errorText]}>
                    No seats available for the selected time slot
                  </Text>
                </View>
              )}
          </View>

          {/* Payment */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Method *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowPaymentDropdown(!showPaymentDropdown)}
            >
              <Text style={styles.dropdownText}>{paymentMethod}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {showPaymentDropdown && (
              <View style={styles.dropdownMenu}>
                {paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setPaymentMethod(method);
                      setShowPaymentDropdown(false);
                      setIsDirty(true);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{method}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={v => {
                  setAmount(v);
                  setIsDirty(true);
                }}
                keyboardType="decimal-pad"
                placeholder="Enter amount"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isPending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <Text style={styles.submitButtonText}>Adding...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Add Student</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* <View style={{ height: 100 }} /> */}
      </KeyboardAwareScrollView>
    </SafeAreaViewContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    // paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    opacity: 0.8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  timeButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
  timeSeparator: {
    opacity: 0.6,
    color: '#000',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    color: '#000',
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
  dropdownArrow: {
    color: '#000',
    fontSize: 16,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownItemText: {
    color: '#000',
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingLeft: 12,
    backgroundColor: '#fff',
  },
  currencySymbol: {
    fontWeight: '600',
    marginRight: 8,
    color: '#000',
    fontSize: 16,
  },
  amountInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000',
    fontFamily: fontFamily.MONTSERRAT.medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: fontFamily.MONTSERRAT.semiBold,
  },

  // Seat selection styles
  messageContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    fontFamily: fontFamily.MONTSERRAT.medium,
    color: '#000',
  },
  errorText: {
    color: '#ef4444',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
    color: '#000',
  },
  seatsScrollView: {
    maxHeight: 100,
  },
  seatsContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  seatCard: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  seatCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  seatNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  seatNumberSelected: {
    color: '#3b82f6',
  },
});

export default AddStudentScreen;
