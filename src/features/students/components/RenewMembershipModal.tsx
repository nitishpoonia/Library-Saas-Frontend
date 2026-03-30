import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRenewMembership } from '../studentQueries/studentQueries';
import { fontFamily } from '../../../constants/fonts';
import Toast from 'react-native-toast-message';

/* -------------------- Validation Schema -------------------- */

const renewMembershipSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError('Please enter a valid amount')
    .required('Please enter amount')
    .positive('Amount must be greater than 0'),
  payment_method: yup.string().required('Please select a payment method'),
  renewal_days: yup
    .number()
    .typeError('Please enter valid number of days')
    .required('Please enter renewal days')
    .positive('Days must be greater than 0')
    .integer('Days must be a whole number'),
  notes: yup.string().optional(),
  seat_number: yup.string().optional(),
  timing: yup.string().optional(),
});

interface RenewMembershipFormData {
  amount: number;
  payment_method: string;
  renewal_days: number;
  notes?: string;
  seat_number?: string;
  timing?: string;
}

interface RenewMembershipModalProps {
  visible: boolean;
  onClose: () => void;
  libraryId: number;
  studentId: number;
  membershipId: number;
  memberId?: number;
  currentMembership: any;
  onSuccess: (receiptData: any) => void;
}

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

/* -------------------- Component -------------------- */

const RenewMembershipModal: React.FC<RenewMembershipModalProps> = ({
  visible,
  onClose,
  libraryId,
  studentId,
  membershipId,
  currentMembership,
  onSuccess,
}) => {
  const { mutate: renewMembershipMutate, isPending } = useRenewMembership();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RenewMembershipFormData>({
    resolver: yupResolver(renewMembershipSchema) as any,
    defaultValues: {
      amount: undefined,
      payment_method: '',
      renewal_days: 30,
      notes: '',
      seat_number: currentMembership?.seat?.seatNumber || '',
      timing: currentMembership?.timing || '',
    },
  });

  const paymentMethod = watch('payment_method');

  const handlePaymentMethodSelect = (method: string) => {
    setValue('payment_method', method);
  };

  const onSubmit: SubmitHandler<RenewMembershipFormData> = data => {
    const renewalPayload = {
      membership_id: membershipId,
      student_id: studentId,
      amount: data.amount,
      payment_method: data.payment_method,
      renewal_days: data.renewal_days,
      ...(data.notes && { notes: data.notes }),
      ...(data.seat_number && { seat_number: data.seat_number }),
      ...(data.timing && { timing: data.timing }),
    };

    renewMembershipMutate(
      { libraryId, payload: renewalPayload },
      {
        onSuccess: responseData => {
          Toast.show({
            type: 'success',
            text1: 'Membership renewed successfully',
          });

          // Call onSuccess callback with receipt data
          onSuccess({
            ...responseData.receipt,
            library_name: 'Library',
            library_address: 'Address',
            student_name: responseData.receipt.student_name,
            student_phone: currentMembership?.seat?.studentPhone || '',
          });

          reset();
          onClose();
        },
        onError: () => {
          Alert.alert('Error', 'Failed to renew membership. Please try again.');
        },
      },
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) =>
    `₹${Number(amount).toLocaleString('en-IN')}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Renew Membership</Text>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isPending}
          >
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Current Membership Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>CURRENT MEMBERSHIP</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Current End Date</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(currentMembership?.endDate)}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Days Remaining</Text>
                  <Text style={[styles.infoValue, styles.accentText]}>
                    {currentMembership?.daysRemaining || 0} days
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Fee</Text>
                  <Text style={styles.infoValue}>
                    {formatCurrency(currentMembership?.totalFee || 0)}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Pending Amount</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      currentMembership?.pendingAmount > 0 &&
                        styles.warningText,
                    ]}
                  >
                    {formatCurrency(currentMembership?.pendingAmount || 0)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Renewal Details */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>RENEWAL DETAILS</Text>

              {/* Amount */}
              <Text style={styles.label}>Amount to Pay *</Text>
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
                    placeholderTextColor="#999"
                    editable={!isPending}
                  />
                )}
              />
              {errors.amount && (
                <Text style={styles.error}>{errors.amount.message}</Text>
              )}

              {/* Payment Method */}
              <Text style={styles.label}>Payment Method *</Text>
              <View style={styles.methodGrid}>
                {PAYMENT_METHODS.map(method => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.methodButton,
                      paymentMethod === method && styles.methodButtonActive,
                    ]}
                    onPress={() => handlePaymentMethodSelect(method)}
                    disabled={isPending}
                  >
                    <Text
                      style={[
                        styles.methodButtonText,
                        paymentMethod === method &&
                          styles.methodButtonTextActive,
                      ]}
                    >
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.payment_method && (
                <Text style={styles.error}>
                  {errors.payment_method.message}
                </Text>
              )}

              {/* Renewal Days */}
              <Text style={styles.label}>Renewal Days *</Text>
              <Controller
                control={control}
                name="renewal_days"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.renewal_days && styles.inputError,
                    ]}
                    value={value?.toString() || ''}
                    onChangeText={text =>
                      onChange(text ? parseInt(text, 10) : undefined)
                    }
                    keyboardType="number-pad"
                    placeholder="30"
                    placeholderTextColor="#999"
                    editable={!isPending}
                  />
                )}
              />
              {errors.renewal_days && (
                <Text style={styles.error}>{errors.renewal_days.message}</Text>
              )}

              {/* Notes */}
              <Text style={styles.label}>Notes (Optional)</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Add any notes..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    editable={!isPending}
                  />
                )}
              />

              {/* Seat Number (Optional) */}
              <Text style={styles.label}>Seat Number (Optional)</Text>
              <Controller
                control={control}
                name="seat_number"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.seat_number && styles.inputError,
                    ]}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder={
                      currentMembership?.seat?.seatNumber || 'Seat number'
                    }
                    placeholderTextColor="#999"
                    editable={!isPending}
                  />
                )}
              />

              {/* Timing (Optional) */}
              <Text style={styles.label}>Timing (Optional)</Text>
              <Controller
                control={control}
                name="timing"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.timing && styles.inputError]}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder={
                      currentMembership?.timing || 'HH:MM AM - HH:MM PM'
                    }
                    placeholderTextColor="#999"
                    editable={!isPending}
                  />
                )}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleClose}
            disabled={isPending}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
            onPress={handleSubmit(onSubmit as any)}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Renew Membership</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RenewMembershipModal;

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#1F2937',
  },
  closeBtn: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: fontFamily.MONTSERRAT.regular,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#6B7280',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: fontFamily.MONTSERRAT.regular,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: '#1F2937',
    textAlign: 'right',
  },
  accentText: {
    color: '#6366F1',
  },
  warningText: {
    color: '#EF4444',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },
  formSection: {
    marginBottom: 28,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    fontSize: 14,
    color: '#1F2937',
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    fontFamily: fontFamily.MONTSERRAT.medium,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: fontFamily.MONTSERRAT.medium,
    marginTop: 4,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  methodButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  methodButtonText: {
    fontSize: 12,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: '#6B7280',
  },
  methodButtonTextActive: {
    color: '#6366F1',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    fontSize: 14,
    color: '#6B7280',
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    fontSize: 14,
    color: '#fff',
  },
});
