import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CommonStyles } from '../CommonStyles';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import ErrorText from '../../../components/feedback/ErrorText';
import { signInSchema } from '../authSchema/authSchema';
import { useNavigation } from '@react-navigation/native';
import { useSignInQuery } from '../authQuery/authQueries';
import { useDispatch } from 'react-redux';
import {
  setSignInData,
  setSignInError,
  setSignInLoading,
} from '../authSlice/authSlice';
import Toast from 'react-native-toast-message';

const SignIn = () => {
  // States
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { mutate, isPending } = useSignInQuery();

  const dispatch = useDispatch();
  // Navigation
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
      agreedToTerms: false,
    },
  });

  const onSubmit = data => {
    dispatch(setSignInLoading(true));
    const payload = {
      identifier: data.identifier.trim().toLowerCase(),
      password: data.password,
    };
    console.log('Data for pyalod', payload);
    console.log('data', data);

    mutate(payload, {
      onSuccess: response => {
        console.log('Success response', response);
        dispatch(setSignInData(response));
        Toast.show({
          type: 'success',
          text1: 'Sign In Successful',
          text2: `Welcome back, ${response.owner.name}!`,
        });
      },
      onError: error => {
        console.error('Error while sign in', error);
        dispatch(setSignInError(error.message));
        Toast.show({
          type: 'error',
          text1: 'Sign In Failed',
          text2: error.message,
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
          <Text style={CommonStyles.title}>Log In</Text>
          <Text style={CommonStyles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={CommonStyles.form}>
          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, value } }) => (
              <View
                style={[
                  CommonStyles.inputContainer,
                  errors.identifier && CommonStyles.inputError,
                ]}
              >
                <FontAwesome6
                  name="id-badge"
                  iconStyle="solid"
                  style={CommonStyles.icon}
                />
                <View>
                  <TextInput
                    placeholder="Enter your phone or email"
                    value={value}
                    onChangeText={onChange}
                    style={CommonStyles.input}
                    // editable={!isPending}
                  />
                </View>
              </View>
            )}
          />
          <ErrorText message={errors.identifier?.message} />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View
                style={[
                  CommonStyles.inputContainer,
                  errors.password && CommonStyles.inputError,
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
                    errors.password && CommonStyles.inputError,
                  ]}
                  placeholder="Password"
                  secureTextEntry={!isPasswordVisible}
                  value={value}
                  onChangeText={onChange}
                  // editable={!isPending}
                />

                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(prevState => !prevState)}
                  style={{ marginLeft: 30, marginTop: 3 }}
                  activeOpacity={0.7}
                >
                  <FontAwesome6
                    name={isPasswordVisible ? 'eye' : 'eye-slash'}
                    iconStyle="solid"
                    style={CommonStyles.icon}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          <ErrorText message={errors.password?.message} />
          {/* Terms and Conditions Checkbox */}
          <Controller
            control={control}
            name="agreedToTerms"
            render={({ field: { value, onChange } }) => (
              <TouchableOpacity
                style={CommonStyles.checkboxContainer}
                onPress={() => onChange(!value)}
                activeOpacity={0.7}
                // disabled={isPending}
              >
                <FontAwesome6
                  name={value ? 'square-check' : 'square'}
                  iconStyle={value ? 'solid' : 'regular'}
                  style={CommonStyles.icon}
                />

                <Text style={CommonStyles.checkboxText}>
                  I agree to the{' '}
                  <Text style={CommonStyles.linkTextInline}>
                    Terms & Conditions
                  </Text>{' '}
                  and{' '}
                  <Text style={CommonStyles.linkTextInline}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
          />

          <ErrorText message={errors.agreedToTerms?.message} />
        </View>

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
            <Text style={CommonStyles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={CommonStyles.footer}>
          <Text style={CommonStyles.footerText}>Are you new in this app? </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: 'SignUp' }] })
            }
            disabled={isPending}
          >
            <Text style={CommonStyles.linkText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaViewContainer>
  );
};

export default SignIn;
