import { createStackNavigator } from '@react-navigation/stack';
import AddStudentScreen from '../screens/AddStudents';
import EditStudent from '../screens/EditStudent';
import ListOfStudents from '../screens/ListOfStudents';
import StudentDetail from '../screens/StudentDetail';

const Stack = createStackNavigator();

const StudentStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AddStudent" component={AddStudentScreen} />
      <Stack.Screen name="EditStudent" component={EditStudent} />
      <Stack.Screen name="ViewListOfStudents" component={ListOfStudents} />
      <Stack.Screen name="StudentDetail" component={StudentDetail} />
    </Stack.Navigator>
  );
};

export default StudentStack;
