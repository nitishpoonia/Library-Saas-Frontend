import { StatusBar, StyleSheet, View } from 'react-native';
import React, { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaViewContainer = ({ children }: { children: ReactNode }) => {
  const { top, bottom } = useSafeAreaInsets();
  return (
    <View
      style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}
    >
      <StatusBar animated={true} barStyle={'dark-content'} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
});

export default SafeAreaViewContainer;
