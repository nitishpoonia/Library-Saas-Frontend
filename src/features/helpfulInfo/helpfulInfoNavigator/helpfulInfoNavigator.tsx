import { createStackNavigator } from '@react-navigation/stack';
import OverdueStudentListScreen from '../screens/OverdueStudentListScreen';
import ExpiringSoonStudentListScreen from '../screens/ExpiringSoonStudentList';

const Stack = createStackNavigator();

const HelpfulInfoStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Overdue" component={OverdueStudentListScreen} />
      <Stack.Screen
        name="ExpiringSoon"
        component={ExpiringSoonStudentListScreen}
      />
    </Stack.Navigator>
  );
};

export default HelpfulInfoStack;
