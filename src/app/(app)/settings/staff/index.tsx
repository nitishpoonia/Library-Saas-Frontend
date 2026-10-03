import { router } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";
import { errorMessage } from "@/api/errors";
import type { StaffMember } from "@/api/types";
import { useStaff, useStaffMutations } from "@/features/staff/queries";
import { formatPhone } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import { Button, Card, Chips, EmptyView, ErrorView, LoadingView, Screen, Text, spacing } from "@/ui";

const ROLES = [
  { value: "STAFF" as const, label: "Staff" },
  { value: "MANAGER" as const, label: "Manager" },
];

/** Who else can use this branch, and what they can do (owner only). */
export default function StaffScreen() {
  const library = useLibrary();
  const staff = useStaff(library.id);

  if (staff.isLoading) return <LoadingView />;
  if (!staff.data) return <ErrorView error={staff.error} onRetry={() => staff.refetch()} />;

  return (
    <Screen edges={["bottom", "left", "right"]} footer={<Button title="Add a login" onPress={() => router.push("/settings/staff/new")} />}>
      <Card>
        <Text variant="bodyStrong">What each role can do</Text>
        <Text variant="caption">Staff: students, renewals, collecting fees.</Text>
        <Text variant="caption">Manager: all of that, plus expenses, money on the home screen, seats and branch settings.</Text>
        <Text variant="caption">Only you (the owner) manage logins, branches and the subscription.</Text>
      </Card>
      {staff.data.length === 0 ? <EmptyView title="No logins yet" message={`Add your receptionist so they can work at ${library.name}.`} /> : null}
      {staff.data.map((member) => (
        <StaffRow key={member.id} member={member} />
      ))}
    </Screen>
  );
}

function StaffRow({ member }: { member: StaffMember }) {
  const library = useLibrary();
  const { changeRole, remove } = useStaffMutations(library.id);

  const confirmRemove = () =>
    Alert.alert(`Remove ${member.user.name}?`, `They won't be able to open ${library.name} any more.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => remove.mutate(member.id, { onError: (e) => Alert.alert("Couldn't remove", errorMessage(e)) }) },
    ]);

  return (
    <Card style={styles.card}>
      <View>
        <Text variant="bodyStrong">{member.user.name}</Text>
        <Text variant="caption">{member.user.phone ? formatPhone(member.user.phone) : member.user.email}</Text>
      </View>
      <Chips options={ROLES} value={member.role} onChange={(role) =>
          role !== member.role &&
          changeRole.mutate(
            { staffId: member.id, role },
            { onError: (e) => Alert.alert("Couldn't change the role", errorMessage(e)) },
          )
        }
      />
      <Button title="Remove access" variant="ghost" onPress={confirmRemove} style={styles.remove} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  remove: { alignSelf: "flex-start", borderColor: "transparent", minHeight: 36, paddingHorizontal: 0 },
});

