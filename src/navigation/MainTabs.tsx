import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import MainStack from './MainNavigator';
import { fontFamily } from '../constants/fonts';
import { Text } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SettingNavigator } from '../features/settings/settingsNavigation/SettingNavigator';

export type MainTabParamList = {
  HomeStack: undefined;
  SettingsStack: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabBarIconProps = {
  routeName: keyof MainTabParamList;
  focused: boolean;
  color: string;
  size: number;
};

const TabBarIcon = ({ routeName, focused, color, size }: TabBarIconProps) => {
  switch (routeName) {
    case 'HomeStack':
      return (
        <Ionicons
          name={focused ? 'home' : 'home-outline'}
          size={size}
          color={color}
        />
      );
    case 'SettingsStack':
      return (
        <Ionicons
          name={focused ? 'cog' : 'cog-outline'}
          size={size}
          color={color}
        />
      );
    default:
      return (
        <FontAwesome6
          name="question"
          size={size}
          color={color}
          iconStyle={focused ? 'solid' : 'regular'}
        />
      );
  }
};

const screenOptions = ({
  route,
}: {
  route: { name: keyof MainTabParamList };
}) => ({
  headerShown: false,
  tabBarLabelStyle: {
    fontFamily: fontFamily.MONTSERRAT.regular,
  },
  tabBarActiveTintColor: '#526ea8',
  tabBarInactiveTintColor: 'gray',
  tabBarIcon: ({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: string;
    size: number;
  }) => (
    <TabBarIcon
      routeName={route.name}
      focused={focused}
      color={color}
      size={size}
    />
  ),

  tabBarLabel: () => {
    switch (route.name) {
      case 'HomeStack':
        return (
          <Text
            style={{
              fontFamily: fontFamily.MONTSERRAT.regular,
            }}
          >
            Home
          </Text>
        );
      case 'SettingsStack':
        return (
          <Text
            style={{
              fontFamily: fontFamily.MONTSERRAT.regular,
            }}
          >
            Menu
          </Text>
        );
      default:
        return route.name;
    }
  },
});

const MainTabs = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="HomeStack" component={MainStack} />
      <Tab.Screen name="SettingsStack" component={SettingNavigator} />
    </Tab.Navigator>
  );
};

export default MainTabs;
