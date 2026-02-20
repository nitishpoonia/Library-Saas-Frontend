import React from 'react';
import { useSelector } from 'react-redux';

import AuthStack from './authNavigator';

import SplashScreen from '../components/SplashScreen';
import { RootState } from '../store';
import SetupStack from './SetupNavigator';
import MainTabs from './MainTabs';

const RootNavigator = () => {
  const { isAuthenticated, isLoading, isLibraryCreated } = useSelector(
    (state: RootState) => state.auth,
  );

  // Show splash screen while checking auth status
  if (isLoading) {
    return <SplashScreen />;
  }

  // User is not authenticated - show auth stack (SignUp/SignIn)
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // User is authenticated but library not created - show LibrarySetup
  if (isAuthenticated && isLibraryCreated === false) {
    return <SetupStack />;
  }

  // User is authenticated and library is created - show main app
  return <MainTabs />;
};

export default RootNavigator;
