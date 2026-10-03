import { router } from "expo-router";
import { LibraryForm } from "@/features/libraries/LibraryForm";
import { useCurrentLibrary } from "@/session/CurrentLibrary";
import { Screen } from "@/ui";

export default function NewBranchScreen() {
  const { select } = useCurrentLibrary();
  return (
    <Screen form edges={["bottom", "left", "right"]}>
      <LibraryForm
        submitLabel="Add branch"
        onCreated={(id) => {
          select(id);
          router.back();
        }}
      />
    </Screen>
  );
}
