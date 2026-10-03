import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router/js-tabs";
import type { ColorValue } from "react-native";
import { colors, fonts } from "@/ui";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const icon =
  (focused: IconName, idle: IconName) =>
  ({ color, size, focused: isFocused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={isFocused ? focused : idle} size={size} color={color as string} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home", "home-outline") }} />
      <Tabs.Screen name="students" options={{ title: "Students", tabBarIcon: icon("people", "people-outline") }} />
      <Tabs.Screen name="menu" options={{ title: "Menu", tabBarIcon: icon("menu", "menu-outline") }} />
    </Tabs>
  );
}
