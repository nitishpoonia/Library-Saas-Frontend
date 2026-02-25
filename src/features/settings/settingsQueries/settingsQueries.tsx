import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getLibraryDetails,
  getUserProfile,
  udpatePassword,
  updateLibraryDetails,
  updateUserProfile,
} from '../settingsServices/settingsServices';
import { updateLibraryCreatedFlag } from '../../../utils/Keychain';

export const useGetUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });
};

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: updateData => updateUserProfile(updateData),
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: passwordData => udpatePassword(passwordData),
  });
};

export const useGetLibraryDetail = libraryId => {
  return useQuery({
    queryKey: ['libraryDetails'],
    queryFn: () => getLibraryDetails(libraryId),
    enabled: !!libraryId,
  });
};

export const useUpdateLibraryDetails = () => {
  return useMutation({
    mutationFn: libraryUpdateData => updateLibraryDetails(libraryUpdateData),
  });
};
