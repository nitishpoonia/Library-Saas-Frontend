import { Stack } from "expo-router";
import { useMemo } from "react";
import { stackOptions } from "./navigationTheme";
import { useTheme } from "./theme";

/**
 * The stack inside each tab. It exists so tab roots get a real native header: a large
 * title that shrinks as you scroll on iOS, a Material top app bar on Android.
 */
export function TabStack({ screen, title }: { screen: string; title: string }) {
  const t = useTheme();
  const options = useMemo(() => stackOptions(t, { largeTitle: true }), [t]);
  return (
    <Stack screenOptions={options}>
      <Stack.Screen name={screen} options={{ title }} />
    </Stack>
  );
}
