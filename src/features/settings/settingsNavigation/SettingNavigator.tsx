import { createStackNavigator } from '@react-navigation/stack';
import Profile from '../screens/Profile';
import Menu from '../screens/Menu';
import ChangePassword from '../screens/ChangePassword';
import EditProfile from '../screens/EditProfile';

const Stack = createStackNavigator();

export const SettingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Menu" component={Menu} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
};
