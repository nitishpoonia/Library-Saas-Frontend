import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

import { toastConfig } from './components/feedback/CustomToast';
import RootNavigator from './navigation/RootNavigator';

const App = () => {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </KeyboardProvider>
      </GestureHandlerRootView>

      <Toast config={toastConfig} />
    </>
  );
};

export default App;
