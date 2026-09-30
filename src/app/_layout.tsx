import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { queryClient } from "@/api/queryClient";
import { configureNotifications } from "@/features/notifications/push";
import { SessionProvider, useSession } from "@/session/SessionProvider";
import { navigationTheme, useTheme } from "@/ui";

void SplashScreen.preventAutoHideAsync();
configureNotifications();

export default function RootLayout() {
  const theme = useTheme();
  const navTheme = useMemo(() => navigationTheme(theme), [theme]);
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <SessionProvider>
            {/* Follows light/dark mode; also stops native tabs flashing white in dark mode. */}
            <ThemeProvider value={navTheme}>
              <StatusBar style="auto" />
              <RootNavigator />
            </ThemeProvider>
          </SessionProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Signed-out users only see (auth); signed-in users only see (app). Switching happens
 * by changing the guard, so there's no redirect flicker and the back button can't
 * return to the other side.
 */
function RootNavigator() {
  const { status } = useSession();
  const loading = status === "loading";

  useEffect(() => {
    if (!loading) void SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === "signedOut"}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={status === "signedIn"}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
