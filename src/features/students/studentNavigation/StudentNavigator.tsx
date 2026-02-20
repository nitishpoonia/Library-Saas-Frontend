import { createStackNavigator } from '@react-navigation/stack';
import AddStudentScreen from '../screens/AddStudents';
import ListOfStudents from '../screens/ListOfStudents';

const Stack = createStackNavigator();

const StudentStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AddStudent" component={AddStudentScreen} />
      <Stack.Screen name="ViewListOfStudents" component={ListOfStudents} />
    </Stack.Navigator>
  );
};

export default StudentStack;
