import { createStackNavigator } from '@react-navigation/stack';
import AddExpense from '../screens/AddExpense';
import ViewAllExpenses from '../screens/ViewAllExpenses';

const Stack = createStackNavigator();

const FinanceStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AddExpense" component={AddExpense} />
      <Stack.Screen name="ViewAllExpenses" component={ViewAllExpenses} />
    </Stack.Navigator>
  );
};

export default FinanceStack;
