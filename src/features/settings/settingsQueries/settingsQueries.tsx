import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getUserProfile,
  udpatePassword,
  updateUserProfile,
} from '../settingsServices/settingsServices';

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
