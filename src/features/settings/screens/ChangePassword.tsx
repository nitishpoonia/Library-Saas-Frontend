import React, { useState } from 'react';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import Header from '../../../components/ui/Header';
import { useNavigation } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import { changePasswordSchema } from '../schema/ChangePasswordSchema';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonStyles } from '../../auth/CommonStyles';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { TextInput } from 'react-native-gesture-handler';
import ErrorText from '../../../components/feedback/ErrorText';
import { useUpdatePassword } from '../settingsQueries/settingsQueries';
import Toast from 'react-native-toast-message';

const ChangePassword = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePassword = field => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const { mutate, isPending } = useUpdatePassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = data => {
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };
    mutate(payload, {
      onSuccess: response => {
        Toast.show({
          type: 'success',
          text1: response.message,
        });
        Keyboard.dismiss();
      },
      onError: error => {
        console.error('Error in error', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
        });
      },
    });
  };
  return (
    <SafeAreaViewContainer>
      <Header
        title="Change Password"
        navigation={navigation}
        disabled={isPending}
      />
      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              CommonStyles.inputContainer,
              errors.currentPassword && CommonStyles.inputError,
            ]}
          >
            <FontAwesome6
              name="lock"
              iconStyle="solid"
              style={CommonStyles.icon}
            />

            <TextInput
              style={[
                CommonStyles.input,
                errors.currentPassword && CommonStyles.inputError,
              ]}
              placeholder="Enter current password"
              secureTextEntry={!showPassword.current}
              value={value}
              onChangeText={onChange}
              // editable={!isPending}
            />

            <TouchableOpacity
              onPress={() => togglePassword('current')}
              style={{ marginLeft: 30, marginTop: 3 }}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name={showPassword.current ? 'eye' : 'eye-slash'}
                iconStyle="solid"
                style={CommonStyles.icon}
              />
            </TouchableOpacity>
          </View>
        )}
      />
      <ErrorText message={errors.currentPassword?.message} />
      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              CommonStyles.inputContainer,
              errors.newPassword && CommonStyles.inputError,
            ]}
          >
            <FontAwesome6
              name="lock"
              iconStyle="solid"
              style={CommonStyles.icon}
            />

            <TextInput
              style={[
                CommonStyles.input,
                errors.newPassword && CommonStyles.inputError,
              ]}
              placeholder="Enter new password"
              secureTextEntry={!showPassword.new}
              value={value}
              onChangeText={onChange}
              // editable={!isPending}
            />

            <TouchableOpacity
              onPress={() => togglePassword('new')}
              style={{ marginLeft: 30, marginTop: 3 }}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name={showPassword.new ? 'eye' : 'eye-slash'}
                iconStyle="solid"
                style={CommonStyles.icon}
              />
            </TouchableOpacity>
          </View>
        )}
      />
      <ErrorText message={errors.newPassword?.message} />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              CommonStyles.inputContainer,
              errors.confirmPassword && CommonStyles.inputError,
            ]}
          >
            <FontAwesome6
              name="lock"
              iconStyle="solid"
              style={CommonStyles.icon}
            />

            <TextInput
              style={[
                CommonStyles.input,
                errors.confirmPassword && CommonStyles.inputError,
              ]}
              placeholder="Enter new password again"
              secureTextEntry={!showPassword.confirm}
              value={value}
              onChangeText={onChange}
              // editable={!isPending}
            />

            <TouchableOpacity
              onPress={() => togglePassword('confirm')}
              style={{ marginLeft: 30, marginTop: 3 }}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name={showPassword.confirm ? 'eye' : 'eye-slash'}
                iconStyle="solid"
                style={CommonStyles.icon}
              />
            </TouchableOpacity>
          </View>
        )}
      />
      <ErrorText message={errors.confirmPassword?.message} />

      <TouchableOpacity
        style={[
          CommonStyles.button,
          isPending && {
            opacity: 0.8,
          },
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator size={'small'} color="white" />
        ) : (
          <Text style={CommonStyles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </SafeAreaViewContainer>
  );
};

export default ChangePassword;
