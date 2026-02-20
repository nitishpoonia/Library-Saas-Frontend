import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import React from 'react';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { fontFamily } from '../../../constants/fonts';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { editProfileSchema } from '../schema/EditProfileSchema';
import { CommonStyles } from '../../auth/CommonStyles';
import ErrorText from '../../../components/feedback/ErrorText';
import { useUpdateUserProfile } from '../settingsQueries/settingsQueries';
import Toast from 'react-native-toast-message';
import Header from '../../../components/ui/Header';

const EditProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mutate, isPending } = useUpdateUserProfile();
  const { exactLevelData } = route?.params;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editProfileSchema),
    defaultValues: {
      name: exactLevelData?.name,
      email: exactLevelData?.email,
      phone: exactLevelData?.phone?.replace(/^\+91/, ''),
    },
  });

  const onSubmit = data => {
    const updateData = {
      name: data.name,
      email: data.email,
      phone: `+91${data.phone}`,
    };
    mutate(updateData, {
      onSuccess: response => {
        Toast.show({
          type: 'success',
          text1: response.message,
        });
        Keyboard.dismiss();
      },
      onError: error => {
        console.log('Error in ', error);

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
        title="Edit Profile"
        navigation={navigation}
        disabled={isPending}
      />
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              CommonStyles.inputContainer,
              errors.name && CommonStyles.inputError,
              {
                marginTop: 10,
              },
            ]}
          >
            <FontAwesome6
              name="id-badge"
              iconStyle="solid"
              style={CommonStyles.icon}
            />
            <View>
              <TextInput
                placeholder="Enter your name"
                value={value}
                onChangeText={onChange}
                style={CommonStyles.input}
                // editable={!isPending}
              />
            </View>
          </View>
        )}
      />
      <ErrorText message={errors.name?.message} />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              CommonStyles.inputContainer,
              errors.email && CommonStyles.inputError,
            ]}
          >
            <FontAwesome6
              name="envelope"
              iconStyle="solid"
              style={CommonStyles.icon}
            />

            <TextInput
              style={[
                CommonStyles.input,
                errors.email && CommonStyles.inputError,
              ]}
              placeholder="Enter your email"
              value={value}
              onChangeText={onChange}
              // editable={!isPending}
            />
          </View>
        )}
      />
      <ErrorText message={errors.phone?.message} />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              CommonStyles.inputContainer,
              errors.phone && CommonStyles.inputError,
            ]}
          >
            <FontAwesome6
              name="phone"
              iconStyle="solid"
              style={CommonStyles.icon}
            />

            <TextInput
              style={[
                CommonStyles.input,
                errors.phone && CommonStyles.inputError,
              ]}
              placeholder="Enter your phone number"
              value={value}
              onChangeText={onChange}
              maxLength={10}
              // editable={!isPending}
            />
          </View>
        )}
      />
      <ErrorText message={errors.phone?.message} />

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
          <Text style={CommonStyles.buttonText}>Update Profile</Text>
        )}
      </TouchableOpacity>
    </SafeAreaViewContainer>
  );
};

export default EditProfile;
