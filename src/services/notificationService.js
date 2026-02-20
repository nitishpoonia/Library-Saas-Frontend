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
      console.log('FCM Token:', token);
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
      console.log('log for register token', response);

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

    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification:', remoteMessage);
    });

    const unsubscribeOnOpen = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('Notification opened app:', remoteMessage);
      },
    );

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background notification:', remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state:', remoteMessage);
        }
      });

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      console.log('Token refreshed:', token);
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
