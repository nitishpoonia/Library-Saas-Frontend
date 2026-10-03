import { router, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";
import { ExpenseForm } from "@/features/expenses/ExpenseForm";
import { useDeleteExpense, useSaveExpense } from "@/features/expenses/queries";
import { useLibrary } from "@/session/CurrentLibrary";
import { Button } from "@/ui";

/** Edit an expense. The list passes its current values as route params. */
export default function EditExpenseScreen() {
  const library = useLibrary();
  const p = useLocalSearchParams<{ expenseId: string; title: string; category: string; amount: string; spentOn: string; notes?: string }>();
  const id = Number(p.expenseId);
  const save = useSaveExpense(library.id, id);
  const remove = useDeleteExpense(library.id, id);

  const confirmDelete = () =>
    Alert.alert("Delete this expense?", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(undefined, { onSuccess: () => router.back() }) },
    ]);

  return (
    <ExpenseForm
      initial={{ title: p.title, category: p.category, amount: Number(p.amount), spentOn: p.spentOn, notes: p.notes ?? "" }}
      submitLabel="Save"
      saving={save.isPending}
      error={save.error ?? remove.error}
      onSubmit={(input) => save.mutate(input, { onSuccess: () => router.back() })}
      extra={<Button title="Delete expense" variant="danger" onPress={confirmDelete} loading={remove.isPending} />}
    />
  );
}
