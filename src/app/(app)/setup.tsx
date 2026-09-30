import { useMe } from "@/features/account/queries";
import { AuthShell } from "@/features/auth/AuthShell";
import { LibraryForm } from "@/features/libraries/LibraryForm";
import { useCurrentLibrary } from "@/session/CurrentLibrary";
import { useSession } from "@/session/SessionProvider";
import { Button, Text } from "@/ui";

/** First run: an owner sets up their first branch. Staff without a branch see a notice. */
export default function SetupScreen() {
  const me = useMe();
  const { select } = useCurrentLibrary();
  const { signOut } = useSession();

  if (!me.data?.organization) {
    return (
      <AuthShell title="No branch yet" subtitle="Your login isn't linked to any branch.">
        <Text variant="body">Ask the library owner to add you as staff, then sign in again.</Text>
        <Button title="Sign out" variant="secondary" onPress={() => signOut()} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set up your library" subtitle="Add your first branch. You can add more later.">
      <LibraryForm submitLabel="Create library" onCreated={select} />
    </AuthShell>
  );
}
