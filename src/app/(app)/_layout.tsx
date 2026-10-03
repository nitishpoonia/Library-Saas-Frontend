import { Stack } from "expo-router";
import { useMe } from "@/features/account/queries";
import { useNotifications } from "@/features/notifications/useNotifications";
import { CurrentLibraryProvider, useCanManage, useCurrentLibrary } from "@/session/CurrentLibrary";
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
  const canManage = useCanManage();
  const isOwner = !!me.data?.organization;
  useNotifications(library !== null);

  if (isLoading) return <LoadingView />;
  // Only when there's nothing to show. A failed background refetch keeps the cached
  // data, and swapping the whole navigator out for it would lose the user's place.
  if (me.error && !me.data) return <ErrorView error={me.error} onRetry={() => me.refetch()} />;

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
        <Stack.Screen name="students/new" options={{ title: "Add student" }} />
        <Stack.Screen name="students/[studentId]/index" options={{ title: "" }} />
        <Stack.Screen name="students/[studentId]/edit" options={{ title: "Edit student" }} />
        <Stack.Screen name="students/[studentId]/renew" options={{ title: "Renew membership" }} />
        <Stack.Screen name="memberships/[membershipId]/pay" options={{ title: "Collect fee" }} />
        <Stack.Screen name="receipts/[paymentId]" options={{ title: "Receipt" }} />
        <Stack.Screen name="settings/profile" options={{ title: "Your profile" }} />
        <Stack.Screen name="settings/password" options={{ title: "Change password" }} />

        {/* The backend enforces roles too; hiding screens keeps the app from offering what would fail. */}
        <Stack.Protected guard={canManage}>
          <Stack.Screen name="expenses/new" options={{ title: "Add expense" }} />
          <Stack.Screen name="expenses/[expenseId]" options={{ title: "Expense" }} />
          <Stack.Screen name="settings/branch" options={{ title: "Branch settings" }} />
          <Stack.Screen name="settings/seats" options={{ title: "Seats" }} />
        </Stack.Protected>
        <Stack.Protected guard={isOwner}>
          <Stack.Screen name="settings/staff/index" options={{ title: "Staff logins" }} />
          <Stack.Screen name="settings/staff/new" options={{ title: "Add a login" }} />
          <Stack.Screen name="billing" options={{ title: "Subscription" }} />
        </Stack.Protected>
      </Stack.Protected>
      <Stack.Protected guard={!hasBranch}>
        <Stack.Screen name="setup" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
