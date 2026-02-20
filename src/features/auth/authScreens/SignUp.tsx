import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import ErrorText from '../../../components/feedback/ErrorText';
import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { signUpSchema } from '../authSchema/authSchema';
import { useSignupQuery } from '../authQuery/authQueries';
import {
  setSignupData,
  setSignupError,
  setSignupLoading,
} from '../authSlice/authSlice';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { CommonStyles } from '../CommonStyles';
import { useNavigation } from '@react-navigation/native';
const SignUp = () => {
  // States
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // navigation
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      name: '',
      identifier: '',
      password: '',
      agreedToTerms: false,
    },
  });

  const { mutate, isPending } = useSignupQuery();

  const onSubmit = data => {
    dispatch(setSignupLoading(true));
    console.log('Form Data:', data);
    const payload = {
      name: data.name,
      identifier: data.identifier.trim().toLowerCase(),
      password: data.password,
    };
    mutate(payload, {
      onSuccess: response => {
        dispatch(setSignupData(response));
        Toast.show({
          type: 'success',
          text1: 'Signup Successful',
          text2: 'Plase fill up your library details to continue',
        });
      },
      onError: error => {
        console.error('Signup failed:', error);
        dispatch(setSignupError(error.message));
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
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
          <Text style={CommonStyles.title}>Create Account</Text>
          <Text style={CommonStyles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={CommonStyles.form}>
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
                  name="user"
                  iconStyle="solid"
                  style={CommonStyles.icon}
                />
                <View>
                  <TextInput
                    placeholder="Full Name"
                    value={value}
                    onChangeText={onChange}
                    style={CommonStyles.input}
                  />
                </View>
              </View>
            )}
          />
          <ErrorText message={errors.name?.message} />

          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, value } }) => (
              <View
                style={[
                  CommonStyles.inputContainer,
                  errors.name && CommonStyles.inputError,
                ]}
              >
                <FontAwesome6
                  name="id-badge"
                  iconStyle="solid"
                  style={CommonStyles.icon}
                />
                <TextInput
                  style={[
                    CommonStyles.input,
                    errors.identifier && CommonStyles.inputError,
                  ]}
                  placeholder="Email or Phone"
                  value={value}
                  onChangeText={onChange}
                />
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
                />

                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(prevState => !prevState)}
                  style={{ marginLeft: 30, marginTop: 3 }}
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
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator size={'small'} color="white" />
          ) : (
            <Text style={CommonStyles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Already have account */}
        <View style={CommonStyles.footer}>
          <Text style={CommonStyles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] })
            }
          >
            <Text style={CommonStyles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaViewContainer>
  );
};

export default SignUp;
