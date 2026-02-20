import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import ErrorText from '../../../components/feedback/ErrorText';
import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';

import { useCreateLibraryQuery } from '../authQuery/authQueries';
import Toast from 'react-native-toast-message';
import { CommonStyles } from '../CommonStyles';
import { librarySetupSchema } from '../authSchema/authSchema';
import { fontFamily } from '../../../constants/fonts';
import { setLibraryCreated } from '../authSlice/authSlice';
import { useDispatch } from 'react-redux';

const LibrarySetup = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(librarySetupSchema),
    defaultValues: {
      name: 'SOme random name',
      seats: '25',
      address: 'asdklfj akdfja df adjkf lkjad f',
    },
  });

  const { mutate, isPending } = useCreateLibraryQuery();
  const dispatch = useDispatch();
  const onSubmit = data => {
    console.log('Form Data:', data);
    const payload = {
      name: data.name.trim(),
      seats: parseInt(data.seats, 10),
      address: data.address.trim(),
    };

    mutate(payload, {
      onSuccess: response => {
        Toast.show({
          type: 'success',
          text1: 'Library Created Successfully',
          text2: 'Your library has been set up and is ready to use',
        });

        console.log('Response for create libary', response);
        dispatch(setLibraryCreated(true));
        reset();
      },
      onError: error => {
        console.error('Library setup failed:', error);
        Toast.show({
          type: 'error',
          text1: 'Library Setup Failed',
          text2: error.message || 'Something went wrong. Please try again.',
        });
      },
    });
  };

  return (
    <SafeAreaViewContainer>
      <KeyboardAwareScrollView
        style={CommonStyles.keyboardView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={CommonStyles.scrollContent}
      >
        <View>
          <Text style={CommonStyles.title}>Set up your library</Text>
          <Text style={CommonStyles.subtitle}>
            Add your library details to start managing finances, members and
            income.
          </Text>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeContainer}>
          <FontAwesome6
            name="circle-info"
            iconStyle="solid"
            style={styles.noticeIcon}
          />
          <View style={styles.noticeTextContainer}>
            <Text style={styles.noticeTitle}>Important</Text>
            <Text style={styles.noticeText}>
              The seat number is crucial for your library setup. Please ensure
              you enter the correct information as it cannot be changed later.
            </Text>
          </View>
        </View>

        <View style={CommonStyles.form}>
          {/* Library Name Input */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <View
                style={[
                  CommonStyles.inputContainer,
                  errors.name && CommonStyles.inputError,
                ]}
              >
                <FontAwesome6
                  name="building"
                  iconStyle="solid"
                  style={CommonStyles.icon}
                />
                <TextInput
                  placeholder="Library Name (e.g., Nitish's Library)"
                  value={value}
                  onChangeText={onChange}
                  style={[
                    CommonStyles.input,
                    {
                      width: '100%',
                    },
                  ]}
                  editable={!isPending}
                />
              </View>
            )}
          />
          <ErrorText message={errors.name?.message} />

          {/* Number of Seats Input */}
          <Controller
            control={control}
            name="seats"
            render={({ field: { onChange, value } }) => (
              <View
                style={[
                  CommonStyles.inputContainer,
                  errors.seats && CommonStyles.inputError,
                ]}
              >
                <FontAwesome6
                  name="chair"
                  iconStyle="solid"
                  style={CommonStyles.icon}
                />
                <TextInput
                  style={CommonStyles.input}
                  placeholder="Number of Seats (e.g., 50)"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  editable={!isPending}
                />
              </View>
            )}
          />
          <ErrorText message={errors.seats?.message} />

          {/* Address Input */}
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <View
                style={[
                  CommonStyles.inputContainer,
                  styles.addressInputContainer,
                  errors.address && CommonStyles.inputError,
                ]}
              >
                <FontAwesome6
                  name="location-dot"
                  iconStyle="solid"
                  style={[CommonStyles.icon, styles.addressIcon]}
                />
                <TextInput
                  style={[CommonStyles.input, styles.addressInput]}
                  placeholder="Address (e.g., 221B Baker Street, Delhi)"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isPending}
                />
              </View>
            )}
          />
          <ErrorText message={errors.address?.message} />
        </View>

        <TouchableOpacity
          style={[CommonStyles.button, isPending && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          <Text style={CommonStyles.buttonText}>
            {isPending ? 'Saving...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaViewContainer>
  );
};

export default LibrarySetup;

const styles = StyleSheet.create({
  noticeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  noticeIcon: {
    fontSize: 20,
    color: '#FF9800',
    marginTop: 2,
  },
  noticeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 16,
    color: '#E65100',
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
    fontFamily: fontFamily.MONTSERRAT.regular,
  },
  addressInputContainer: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginTop: 12,
  },
  addressInput: {
    minHeight: 90,
    paddingTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
