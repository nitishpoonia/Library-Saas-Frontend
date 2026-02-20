import { apiClientWithAuth, ENDPOINTS } from '../../../constants/api';

export async function addNewExpense(expenseData: any, libraryId: number) {
  const res = await apiClientWithAuth.post(
    ENDPOINTS.EXPENSE.ADD(libraryId),
    expenseData,
  );
  return res.data;
}

export async function listAllExpenses(
  libraryId: number,
  pageParam: number,
  search: string,
  category: string,
) {
  const res = await apiClientWithAuth.get(
    ENDPOINTS.EXPENSE.LIST_ALL_EXPENSES(libraryId),
    {
      params: {
        page: pageParam,
        limit: 20,
        search,
        category,
      },
    },
  );
  return res.data;
}
