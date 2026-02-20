import {
  apiClientWithAuth,
  apiClientWithoutAuth,
  ENDPOINTS,
} from '../../../constants/api';
import { LoginResponse } from '../authTypes/index.types';

export const login = async (payload: any): Promise<LoginResponse> => {
  console.log('Login loging', payload);

  try {
    const response = await apiClientWithoutAuth.post<LoginResponse>(
      ENDPOINTS.AUTH.SIGN_IN,
      payload,
    );
    console.log('Response login', response);

    return response.data;
  } catch (error: any) {
    console.error('Error while logging in the user', error);
    throw new Error(error?.response?.data?.error);
  }
};

export const signup = async (payload: any): Promise<any> => {
  try {
    const response = await apiClientWithoutAuth.post(
      ENDPOINTS.AUTH.SIGN_UP,
      payload,
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error || 'Signup failed. Please try again.';
    throw new Error(message);
  }
};

export const createLibrary = async (payload: any): Promise<any> => {
  try {
    const response = await apiClientWithAuth.post(
      ENDPOINTS.LIBRARIES.CREATE,
      payload,
    );

    console.log('Crete library response', response);

    return response.data;
  } catch (error: any) {
    console.error('Error while creating library', error?.response?.data);
    throw new Error(error?.response?.data?.error);
  }
};
