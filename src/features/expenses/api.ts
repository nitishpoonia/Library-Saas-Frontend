import { api, request } from "@/api/client";
import type { Expense, PageMeta } from "@/api/types";

export type ExpenseInput = { title: string; category: string; amount: number; spentOn: string; notes?: string };

const base = (libraryId: number) => `/libraries/${libraryId}/expenses`;

export const expensesApi = {
  async list(libraryId: number, params: { month: string; page: number }) {
    const res = await request<Expense[]>("GET", base(libraryId), { query: { ...params, limit: 50 } });
    return { items: res.data, meta: res.meta as PageMeta & { totalAmount: number } };
  },
  create: (libraryId: number, input: ExpenseInput) => api.post<Expense>(base(libraryId), input),
  update: (libraryId: number, id: number, input: Partial<ExpenseInput>) => api.patch<Expense>(`${base(libraryId)}/${id}`, input),
  remove: (libraryId: number, id: number) => api.delete(`${base(libraryId)}/${id}`),
};
