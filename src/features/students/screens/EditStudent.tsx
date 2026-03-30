import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
} from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Toast from 'react-native-toast-message';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import Header from '../../../components/ui/Header';
import ErrorText from '../../../components/feedback/ErrorText';
import { CommonStyles } from '../../auth/CommonStyles';
import { editStudentSchema } from '../../settings/schema/EditProfileSchema';
import { useUpdateStudent } from '../studentQueries/studentQueries';

type EditStudentRouteParams = {
  libraryId: number;
  studentId: number;
  name: string;
  phone: string;
};

type EditStudentFormData = {
  name: string;
  phone: string;
};

const EditStudent = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { mutate, isPending } = useUpdateStudent();
  const { libraryId, studentId, name, phone } =
    route.params as EditStudentRouteParams;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditStudentFormData>({
    resolver: yupResolver(editStudentSchema),
    defaultValues: {
      name: name || '',
      phone: (phone || '').replace(/^\+91/, ''),
    },
  });

  const onSubmit = (data: EditStudentFormData) => {
    mutate(
      {
        libraryId: Number(libraryId),
        studentId: Number(studentId),
        studentData: {
          name: data.name.trim(),
          phone: data.phone,
        },
      },
      {
        onSuccess: response => {
          Toast.show({
            type: 'success',
            text1: response.message || 'Student details updated successfully',
          });
          Keyboard.dismiss();
          navigation.goBack();
        },
        onError: error => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message,
          });
        },
      },
    );
  };

  return (
    <SafeAreaViewContainer>
      <Header
        title="Edit Student"
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
              styles.firstInput,
            ]}
          >
            <FontAwesome6
              name="id-badge"
              iconStyle="solid"
              style={CommonStyles.icon}
            />
            <TextInput
              placeholder="Enter student name"
              value={value}
              onChangeText={onChange}
              style={CommonStyles.input}
              editable={!isPending}
            />
          </View>
        )}
      />
      <ErrorText message={errors.name?.message} />

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
              style={CommonStyles.input}
              placeholder="Enter student phone number"
              value={value}
              onChangeText={onChange}
              maxLength={10}
              keyboardType="phone-pad"
              editable={!isPending}
            />
          </View>
        )}
      />
      <ErrorText message={errors.phone?.message} />

      <TouchableOpacity
        style={[CommonStyles.button, isPending && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={CommonStyles.buttonText}>Update Student</Text>
        )}
      </TouchableOpacity>
    </SafeAreaViewContainer>
  );
};

const styles = StyleSheet.create({
  firstInput: {
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
});

export default EditStudent;
