import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { apiClientWithAuth } from '../constants/api';

export const useNotificationService = () => {
  const requestUserPermission = async () => {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      return enabled;
    } else {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }
  };

  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };

  const registerDeviceToken = async token => {
    try {
      const response = await apiClientWithAuth.post(
        '/notification/register-notification-token',
        { token },
      );

      return response;
    } catch (error) {
      console.error('Error registering token:', error);
    }
  };

  useEffect(() => {
    const setup = async () => {
      const permission = await requestUserPermission();
      if (!permission) return;

      const token = await getFCMToken();
      if (token) {
        await registerDeviceToken(token);
      }
    };

    setup();

    // TODO(REVIEW FN1/FN2): show foreground messages, open the right screen on tap,
    // and register the background handler in index.js instead of here.
    const unsubscribeOnMessage = messaging().onMessage(async () => {});

    const unsubscribeOnOpen = messaging().onNotificationOpenedApp(() => {});

    messaging().setBackgroundMessageHandler(async () => {});


    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      registerDeviceToken(token);
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpen();
      unsubscribeTokenRefresh();
    };
  }, []);

  return {
    requestUserPermission,
    getFCMToken,
  };
};
