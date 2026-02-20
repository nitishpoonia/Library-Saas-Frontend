import axios from 'axios';
import { API_CONFIG } from './config';
import { getAuthData } from '../../utils/Keychain';

export const apiClientWithoutAuth = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const apiClientWithAuth = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClientWithAuth.interceptors.request.use(
  async config => {
    const authData = await getAuthData();
    const token = authData?.token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

apiClientWithoutAuth.interceptors.request.use(
  config => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('API Without Auth →', config.method?.toUpperCase(), fullUrl);
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
