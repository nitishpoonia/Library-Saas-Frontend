import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  BackHandler,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAddNewExpense } from '../financeQueries/financeQueries';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import Header from '../../../components/ui/Header';
import { fontFamily } from '../../../constants/fonts';
import { queryClient } from '../../../..';
import Toast from 'react-native-toast-message';

/* -------------------- Validation Schema -------------------- */

const expenseSchema = yup.object().shape({
  title: yup.string().trim().required('Please enter expense title'),
  category: yup.string().trim().required('Please enter expense category'),
  amount: yup
    .number()
    .typeError('Please enter a valid amount')
    .required('Please enter amount')
    .positive('Amount must be greater than 0'),
  expenseDate: yup.date().required('Please select expense date'),
});

type ExpenseFormData = {
  title: string;
  category: string;
  amount: number;
  expenseDate: Date;
};

/* -------------------- Component -------------------- */

const AddExpense = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { libraryId } = route.params as { libraryId: string };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const { mutate: addNewExpenseMutate, isPending } = useAddNewExpense();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(expenseSchema),
    defaultValues: {
      title: '',
      category: '',
      amount: undefined,
      expenseDate: new Date(),
    },
  });

  const expenseDate = watch('expenseDate');

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

  const formatDisplayDate = (date: Date) =>
    date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const onSubmit = (data: ExpenseFormData) => {
    const expenseData = {
      title: data.title,
      category: data.category,
      amount: data.amount,
      expense_date: formatDate(data.expenseDate),
    };

    addNewExpenseMutate(
      {
        expenseData,
        libraryId: Number(libraryId),
      },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Expense added successfully',
          });
          queryClient.invalidateQueries({
            queryKey: ['dashboardOverview'],
          });
          reset();
        },
        onError: () => {
          Alert.alert('Error', 'Failed to add expense. Please try again.');
        },
      },
    );
  };

  const handleCancel = () => {
    if (!isDirty) {
      navigation.goBack();
      return;
    }

    Alert.alert('Discard changes?', 'You have unsaved changes. Discard them?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          reset();
          navigation.goBack();
        },
      },
    ]);
  };

  /* -------------------- Android Back Handler -------------------- */

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (!isDirty) return false;

        Alert.alert('Discard changes?', 'Discard unsaved changes?', [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => {
              reset();
              navigation.goBack();
            },
          },
        ]);

        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [isDirty, navigation, reset]),
  );

  /* -------------------- UI -------------------- */

  return (
    <SafeAreaViewContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Header
            title="Add new expense"
            navigation={navigation}
            disabled={isPending}
          />

          {/* Title */}
          <Text style={styles.label}>Expense Title *</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Electricity Bill"
              />
            )}
          />
          {errors.title && (
            <Text style={styles.error}>{errors.title.message}</Text>
          )}

          {/* Category */}
          <Text style={styles.label}>Category *</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.category && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="utilities"
              />
            )}
          />
          {errors.category && (
            <Text style={styles.error}>{errors.category.message}</Text>
          )}

          {/* Amount */}
          <Text style={styles.label}>Amount *</Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.amount && styles.inputError]}
                value={value?.toString() || ''}
                onChangeText={text =>
                  onChange(text ? parseFloat(text) : undefined)
                }
                keyboardType="decimal-pad"
                placeholder="Enter amount"
              />
            )}
          />
          {errors.amount && (
            <Text style={styles.error}>{errors.amount.message}</Text>
          )}

          {/* Date */}
          <Text style={styles.label}>Expense Date *</Text>
          <Controller
            control={control}
            name="expenseDate"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{formatDisplayDate(value)}</Text>
                  <Ionicons name="calendar-outline" size={20} />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={value}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }

                      if (event.type === 'set' && selectedDate) {
                        onChange(selectedDate);
                      }
                    }}
                  />
                )}
              </>
            )}
          />
          {errors.expenseDate && (
            <Text style={styles.error}>{errors.expenseDate.message}</Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              disabled={isPending}
            >
              <Text
                style={{
                  fontFamily: fontFamily.MONTSERRAT.medium,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              <Text
                style={{
                  color: '#fff',
                  fontFamily: fontFamily.MONTSERRAT.semiBold,
                }}
              >
                {isPending ? 'Adding...' : 'Add Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaViewContainer>
  );
};

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    fontFamily: fontFamily.MONTSERRAT.regular,
    padding: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: fontFamily.MONTSERRAT.medium,

    marginTop: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
});

export default AddExpense;
