import { createStackNavigator } from '@react-navigation/stack';
import LibrarySetup from '../features/auth/authScreens/LibrarySetup';

const Stack = createStackNavigator();

const SetupStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LibrarySetup" component={LibrarySetup} />
    </Stack.Navigator>
  );
};

export default SetupStack;
