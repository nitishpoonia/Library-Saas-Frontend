import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { queryClient } from "@/api/queryClient";
import { configureNotifications } from "@/features/notifications/push";
import { SessionProvider, useSession } from "@/session/SessionProvider";

void SplashScreen.preventAutoHideAsync();
configureNotifications();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    MontserratLight: require("../../assets/fonts/MontserratLight.ttf"),
    MontserratRegular: require("../../assets/fonts/MontserratRegular.ttf"),
    MontserratMedium: require("../../assets/fonts/MontserratMedium.ttf"),
    MontserratSemiBold: require("../../assets/fonts/MontserratSemiBold.ttf"),
    MontserratBold: require("../../assets/fonts/MontserratBold.ttf"),
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <SessionProvider>
            <StatusBar style="dark" />
            <RootNavigator ready={fontsLoaded} />
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
function RootNavigator({ ready }: { ready: boolean }) {
  const { status } = useSession();
  const loading = !ready || status === "loading";

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
