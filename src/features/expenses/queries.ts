import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { keys } from "@/api/keys";
import { useRefreshBranch } from "../students/queries";
import { expensesApi, type ExpenseInput } from "./api";

export function useExpenses(libraryId: number, month: string) {
  return useInfiniteQuery({
    queryKey: keys.expenses(libraryId, month),
    queryFn: ({ pageParam }) => expensesApi.list(libraryId, { month, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.hasNextPage ? last.meta.page + 1 : undefined),
  });
}

export function useSaveExpense(libraryId: number, expenseId?: number) {
  const refresh = useRefreshBranch(libraryId);
  return useMutation({
    mutationFn: (input: ExpenseInput) =>
      expenseId ? expensesApi.update(libraryId, expenseId, input) : expensesApi.create(libraryId, input),
    onSuccess: refresh,
  });
}

export function useDeleteExpense(libraryId: number, expenseId: number) {
  const refresh = useRefreshBranch(libraryId);
  return useMutation({ mutationFn: () => expensesApi.remove(libraryId, expenseId), onSuccess: refresh });
}
