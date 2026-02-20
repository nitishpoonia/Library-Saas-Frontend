import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { initializeAuth } from '../features/auth/authSlice/authSlice';
import { getAuthData } from '../utils/Keychain';

const SplashScreen = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if auth data exists in keychain
      const authData = await getAuthData();
      console.log(';Auth data', authData);

      if (authData) {
        // User is authenticated, initialize auth state
        dispatch(
          initializeAuth({
            token: authData.token,
            isLibraryCreated: authData.isLibraryCreated,
          }),
        );
      } else {
        // No auth data found, user is not authenticated
        dispatch(initializeAuth(null));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // On error, treat as not authenticated
      dispatch(initializeAuth(null));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library App</Text>
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});

export default SplashScreen;
