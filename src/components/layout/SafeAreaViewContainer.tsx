import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import React, { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaViewContainer = ({ children }: { children: ReactNode }) => {
  const { top, bottom } = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View
      style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}
    >
      <StatusBar
        animated={true}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
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
