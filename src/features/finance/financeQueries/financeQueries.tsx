import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { addNewExpense, listAllExpenses } from '../services/financeService';
type AddExpensePayload = {
  expenseData: any;
  libraryId: number;
};
export function useAddNewExpense() {
  return useMutation({
    mutationFn: ({ expenseData, libraryId }: AddExpensePayload) =>
      addNewExpense(expenseData, libraryId),
  });
}

export const useListOfExpenses = (
  libraryId: number,
  search: string,
  category: string,
) => {
  return useInfiniteQuery({
    queryKey: ['expenses', libraryId, search, category],
    queryFn: ({ pageParam = 1 }) =>
      listAllExpenses(libraryId, pageParam, search, category),
    getNextPageParam: lastPage => {
      return lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 0,
    gcTime: 0,
  });
};
