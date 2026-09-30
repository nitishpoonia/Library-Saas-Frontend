import { router } from "expo-router";
import { Alert } from "react-native";
import { errorMessage } from "@/api/errors";
import type { StaffMember } from "@/api/types";
import { useStaff, useStaffMutations } from "@/features/staff/queries";
import { formatPhone } from "@/lib/format";
import { useLibrary } from "@/session/CurrentLibrary";
import { Button, Chips, EmptyView, ErrorView, ListRow, ListSection, LoadingView, Screen, Section, Text, icons, makeStyles, spacing } from "@/ui";

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
    <Screen footer={<Button title="Add a login" onPress={() => router.push("/settings/staff/new")} />}>
      {staff.data.length === 0 ? (
        <EmptyView icon={icons.staff} title="No logins yet" message={`Add your receptionist so they can work at ${library.name}.`} />
      ) : null}
      {staff.data.map((member) => (
        <StaffRow key={member.id} member={member} />
      ))}
      <Section title="What each role can do">
        <Text variant="caption">Staff: students, renewals, collecting fees.</Text>
        <Text variant="caption">Manager: all of that, plus expenses, money on the home screen, seats and branch settings.</Text>
        <Text variant="caption">Only you (the owner) manage logins, branches and the subscription.</Text>
      </Section>
    </Screen>
  );
}

function StaffRow({ member }: { member: StaffMember }) {
  const library = useLibrary();
  const { changeRole, remove } = useStaffMutations(library.id);
  const styles = useStyles();

  const confirmRemove = () =>
    Alert.alert(`Remove ${member.user.name}?`, `They won't be able to open ${library.name} any more.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => remove.mutate(member.id, { onError: (e) => Alert.alert("Couldn't remove", errorMessage(e)) }) },
    ]);

  return (
    <Section title={member.user.name}>
      <Text variant="caption" style={styles.contact}>
        {member.user.phone ? formatPhone(member.user.phone) : member.user.email}
      </Text>
      <Chips options={ROLES} value={member.role} onChange={(role) => role !== member.role && changeRole.mutate({ staffId: member.id, role })} />
      <ListSection>
        <ListRow title="Remove access" icon={icons.trash} destructive onPress={confirmRemove} />
      </ListSection>
    </Section>
  );
}

const useStyles = makeStyles(() => ({
  contact: { paddingHorizontal: spacing.xs, marginTop: -spacing.sm },
}));

