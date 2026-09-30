import * as Application from "expo-application";
import { router } from "expo-router";
import { Alert, View } from "react-native";
import { request } from "@/api/client";
import type { Role } from "@/api/types";
import { useUpdateProfile } from "@/features/account/mutations";
import { useMe } from "@/features/account/queries";
import { getRegisteredToken } from "@/features/notifications/push";
import { formatPhone } from "@/lib/format";
import { useCanManage, useCurrentLibrary } from "@/session/CurrentLibrary";
import { useSession } from "@/session/SessionProvider";
import { ListRow, ListSection, ListSwitchRow, Screen, Text, icons, makeStyles, spacing, tileColors, useTheme } from "@/ui";

const roleLabel: Record<Role, string> = { OWNER: "Owner", MANAGER: "Manager", STAFF: "Staff" };

const tile = tileColors;

export default function MenuScreen() {
  const me = useMe();
  const t = useTheme();
  const styles = useStyles();
  const { library, libraries, select } = useCurrentLibrary();
  const { signOut } = useSession();
  const canManage = useCanManage();
  const updateProfile = useUpdateProfile();
  const isOwner = !!me.data?.organization;
  const user = me.data?.user;

  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You'll need your password to sign in again.", [
      { text: "Cancel", style: "cancel" },
      // Passing the push token stops this phone getting this account's notifications.
      { text: "Sign out", style: "destructive", onPress: () => void signOut({ deviceToken: getRegisteredToken() ?? undefined }) },
    ]);

  const confirmSignOutEverywhere = () =>
    Alert.alert("Sign out on all phones?", "Use this if a phone was lost. Everyone using this login has to sign in again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out everywhere",
        style: "destructive",
        onPress: async () => {
          await request("POST", "/auth/logout-all").catch(() => {});
          await signOut();
        },
      },
    ]);

  return (
    <Screen>
      <ListSection>
        <ListRow
          title={user?.name ?? ""}
          subtitle={user?.phone ? formatPhone(user.phone) : (user?.email ?? undefined)}
          icon={icons.person}
          iconColor={tile.gray}
          onPress={() => router.push("/settings/profile")}
        />
      </ListSection>

      <ListSection title="Branches" footer={libraries.length > 1 ? "Tap a branch to switch to it." : undefined}>
        {libraries.map((l) => {
          const current = l.id === library?.id;
          return (
            <ListRow
              key={l.id}
              title={l.name}
              subtitle={l.address}
              icon={icons.branch}
              iconColor={tile.blue}
              value={roleLabel[l.role]}
              selected={current}
              chevron={false}
              onPress={current ? undefined : () => select(l.id)}
            />
          );
        })}
        {isOwner ? (
          <ListRow title="Add a branch" icon={icons.addBranch} iconColor={tile.green} onPress={() => router.push("/branches/new")} />
        ) : null}
      </ListSection>

      {canManage ? (
        <ListSection title={library?.name}>
          <ListRow title="Branch settings" icon={icons.branch} iconColor={tile.gray} onPress={() => router.push("/settings/branch")} />
          <ListRow title="Seats" icon={icons.seats} iconColor={tile.orange} onPress={() => router.push("/settings/seats")} />
          {isOwner ? (
            <ListRow title="Staff logins" icon={icons.staff} iconColor={tile.indigo} onPress={() => router.push("/settings/staff")} />
          ) : null}
        </ListSection>
      ) : null}

      <ListSection title="Account">
        {isOwner ? <ListRow title="Subscription" icon={icons.card} iconColor={tile.green} onPress={() => router.push("/billing")} /> : null}
        <ListRow title="Change password" icon={icons.key} iconColor={tile.gray} onPress={() => router.push("/settings/password")} />
        <ListSwitchRow
          title="Daily summary"
          subtitle="A notification each morning"
          icon={icons.bell}
          iconColor={tile.red}
          value={user?.notificationsEnabled ?? true}
          onValueChange={(on) => updateProfile.mutate({ notificationsEnabled: on })}
        />
      </ListSection>

      <ListSection>
        <ListRow title="Sign out" icon={icons.signOut} destructive onPress={confirmSignOut} />
        <ListRow title="Sign out on all phones" icon={icons.phone} destructive onPress={confirmSignOutEverywhere} />
      </ListSection>

      <View style={styles.version}>
        <Text variant="label" color={t.colors.textFaint}>
          Version {Application.nativeApplicationVersion ?? "dev"}
        </Text>
      </View>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  version: { alignItems: "center", paddingTop: spacing.sm },
}));
