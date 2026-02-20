import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from '../features/dashboard/screens/Dashbaord';
import FinanceStack from '../features/finance/navigation/FinanceNavigator';
import StudentStack from '../features/students/studentNavigation/StudentNavigator';

export type MainStackParamList = {
  Dashboard: undefined;
  Finance: undefined;
  Student: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Dashboard"
    >
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Finance" component={FinanceStack} />
      <Stack.Screen name="Student" component={StudentStack} />
    </Stack.Navigator>
  );
};

export default MainStack;
