import Ionicons from "@expo/vector-icons/Ionicons";
import * as Application from "expo-application";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Switch, View } from "react-native";
import { request } from "@/api/client";
import { useUpdateProfile } from "@/features/account/mutations";
import { getRegisteredToken } from "@/features/notifications/push";
import type { Role } from "@/api/types";
import { useMe } from "@/features/account/queries";
import { formatPhone } from "@/lib/format";
import { useCanManage, useCurrentLibrary } from "@/session/CurrentLibrary";
import { useSession } from "@/session/SessionProvider";
import { Badge, Card, Screen, Text, colors, spacing } from "@/ui";

const roleLabel: Record<Role, string> = { OWNER: "Owner", MANAGER: "Manager", STAFF: "Staff" };

export default function MenuScreen() {
  const me = useMe();
  const { library, libraries, select } = useCurrentLibrary();
  const { signOut } = useSession();
  const canManage = useCanManage();
  const updateProfile = useUpdateProfile();
  const isOwner = !!me.data?.organization;

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
      <View style={styles.profile}>
        <Text variant="title">{me.data?.user.name}</Text>
        <Text variant="body" color={colors.textMuted}>
          {me.data?.user.phone ? formatPhone(me.data.user.phone) : me.data?.user.email}
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="heading">Branches</Text>
        {libraries.map((l) => {
          const current = l.id === library?.id;
          return (
            <Card key={l.id} onPress={current ? undefined : () => select(l.id)} style={current ? styles.current : undefined}>
              <View style={styles.rowBetween}>
                <View style={styles.flex}>
                  <Text variant="bodyStrong">{l.name}</Text>
                  <Text variant="caption">{l.address}</Text>
                </View>
                <View style={styles.badges}>
                  <Badge label={roleLabel[l.role]} />
                  {current ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
                </View>
              </View>
            </Card>
          );
        })}
        {isOwner ? <MenuRow icon="add-circle-outline" label="Add a branch" onPress={() => router.push("/branches/new")} /> : null}
      </View>

      {canManage ? (
        <View style={styles.section}>
          <Text variant="heading">{library?.name}</Text>
          <MenuRow icon="business-outline" label="Branch settings" onPress={() => router.push("/settings/branch")} />
          <MenuRow icon="grid-outline" label="Seats" onPress={() => router.push("/settings/seats")} />
          {isOwner ? <MenuRow icon="people-circle-outline" label="Staff logins" onPress={() => router.push("/settings/staff")} /> : null}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text variant="heading">Account</Text>
        {isOwner ? <MenuRow icon="card-outline" label="Subscription" onPress={() => router.push("/billing")} /> : null}
        <MenuRow icon="person-outline" label="Your profile" onPress={() => router.push("/settings/profile")} />
        <MenuRow icon="key-outline" label="Change password" onPress={() => router.push("/settings/password")} />
        <View style={styles.menuRow}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <Text variant="bodyStrong" style={styles.flex}>
            Daily summary notifications
          </Text>
          <Switch
            value={me.data?.user.notificationsEnabled ?? true}
            onValueChange={(on) => updateProfile.mutate({ notificationsEnabled: on })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <MenuRow icon="log-out-outline" label="Sign out" danger onPress={confirmSignOut} />
        <MenuRow icon="phone-portrait-outline" label="Sign out on all phones" danger onPress={confirmSignOutEverywhere} />
      </View>

      <Text variant="caption" style={styles.version}>
        Version {Application.nativeApplicationVersion ?? "dev"}
      </Text>
    </Screen>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text variant="bodyStrong" color={color} style={styles.flex}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profile: { gap: spacing.xs },
  section: { gap: spacing.md },
  current: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  rowBetween: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  badges: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flex: { flex: 1 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  version: { textAlign: "center", marginTop: spacing.xl },
});
