import { router } from "expo-router";
import { ExpenseForm } from "@/features/expenses/ExpenseForm";
import { useSaveExpense } from "@/features/expenses/queries";
import { useLibrary } from "@/session/CurrentLibrary";

export default function NewExpenseScreen() {
  const library = useLibrary();
  const save = useSaveExpense(library.id);
  return (
    <ExpenseForm
      submitLabel="Add expense"
      saving={save.isPending}
      error={save.error}
      onSubmit={(input) => save.mutate(input, { onSuccess: () => router.back() })}
    />
  );
}
