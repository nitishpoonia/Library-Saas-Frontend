import { createStackNavigator } from '@react-navigation/stack';
import SignUp from '../features/auth/authScreens/SignUp';
import { AuthStackParamList } from '../features/auth/authTypes/index.types';
import SignIn from '../features/auth/authScreens/SignIn';
import LibrarySetup from '../features/auth/authScreens/LibrarySetup';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="SignIn"
    >
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="LibrarySetup" component={LibrarySetup} />
    </Stack.Navigator>
  );
};

export default AuthStack;
