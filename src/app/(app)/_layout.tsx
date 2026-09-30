import { Stack } from "expo-router";
import { useMe } from "@/features/account/queries";
import { CurrentLibraryProvider, useCurrentLibrary } from "@/session/CurrentLibrary";
import { ErrorView, LoadingView, colors, fonts } from "@/ui";

export default function AppLayout() {
  return (
    <CurrentLibraryProvider>
      <AppStack />
    </CurrentLibraryProvider>
  );
}

/**
 * Signed in, but no branch yet (a new owner, or staff not assigned anywhere):
 * only the setup screen is reachable. Once a branch exists, the tabs take over.
 */
function AppStack() {
  const me = useMe();
  const { library, isLoading } = useCurrentLibrary();

  if (isLoading) return <LoadingView />;
  if (me.error) return <ErrorView error={me.error} onRetry={() => me.refetch()} />;

  const hasBranch = library !== null;

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
        headerTintColor: colors.text,
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={hasBranch}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="branches/new" options={{ title: "New branch", presentation: "modal" }} />
      </Stack.Protected>
      <Stack.Protected guard={!hasBranch}>
        <Stack.Screen name="setup" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
