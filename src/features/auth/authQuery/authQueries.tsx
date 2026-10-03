import { useMutation } from '@tanstack/react-query';
import { createLibrary, login, signup } from '../authServices/authServices';

export const useSignupQuery = () => {
  return useMutation({
    mutationFn: payload => signup(payload),
  });
};

export const useSignInQuery = () => {
  
  return useMutation({
    mutationFn: payload => login(payload),
  });
};
export const useCreateLibraryQuery = () => {
  return useMutation({
    mutationFn: async payload => createLibrary(payload),
  });
};
