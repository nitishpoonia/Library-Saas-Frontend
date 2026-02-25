import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import Header from '../../../components/ui/Header';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CommonStyles } from '../../auth/CommonStyles';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { TextInput } from 'react-native-gesture-handler';
import ErrorText from '../../../components/feedback/ErrorText';
import { editLibrarySchema } from '../schema/EditProfileSchema';
import { useUpdateLibraryDetails } from '../settingsQueries/settingsQueries';
import Toast from 'react-native-toast-message';

const EditLibrary = () => {
  const route = useRoute();
  const { dataSentInParams } = route?.params;
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editLibrarySchema),
    defaultValues: {
      name: dataSentInParams?.name,
      address: dataSentInParams?.address,
      seats: dataSentInParams?.seats,
    },
  });
  console.log('Data sent in params', dataSentInParams);

  const { mutate, isPending } = useUpdateLibraryDetails();

  const onSubmit = data => {
    const libraryUpdateData = {
      libraryName: data.name,
      address: data.address,
      seats: data.seats,
    };
    console.log('Library udpate data', libraryUpdateData);

    mutate(libraryUpdateData, {
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
        title="Edit Library"
        navigation={navigation}
        // disabled={isPending}
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
                placeholder="Enter your library name"
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
        name="address"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              CommonStyles.inputContainer,
              errors.address && CommonStyles.inputError,
              {
                marginTop: 10,
              },
            ]}
          >
            <FontAwesome6
              name="address-book"
              iconStyle="solid"
              style={CommonStyles.icon}
            />
            <View>
              <TextInput
                placeholder="Enter your library name"
                value={value}
                onChangeText={onChange}
                style={CommonStyles.input}

                // editable={!isPending}
              />
            </View>
          </View>
        )}
      />
      <ErrorText message={errors.address?.message} />
      <Controller
        control={control}
        name="seats"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              CommonStyles.inputContainer,
              errors.seats && CommonStyles.inputError,
              { marginTop: 10 },
            ]}
          >
            <FontAwesome6
              name="chair"
              iconStyle="solid"
              style={CommonStyles.icon}
            />
            <View>
              <TextInput
                placeholder="Enter number of seats"
                value={value ? String(value) : ''}
                onChangeText={text => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  onChange(cleaned ? Number(cleaned) : '');
                }}
                style={CommonStyles.input}
                keyboardType="numeric"
                inputMode="numeric"
              />
            </View>
          </View>
        )}
      />
      <ErrorText message={errors.seats?.message} />
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
          <Text style={CommonStyles.buttonText}>Update Library</Text>
        )}
      </TouchableOpacity>
    </SafeAreaViewContainer>
  );
};

export default EditLibrary;
