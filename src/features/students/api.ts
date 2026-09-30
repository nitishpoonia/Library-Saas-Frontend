import { api, request } from "@/api/client";
import type { PageMeta, PaymentMode, Receipt, StudentDetail, StudentListItem } from "@/api/types";

export type StudentStatusFilter = "current" | "active" | "overdue" | "pending" | "expiring" | "inactive" | "archived" | "all";

export type PaymentInput = { amount: number; mode: PaymentMode; notes?: string };

export type NewStudentInput = {
  name: string;
  phone: string;
  membership: {
    seatId: number;
    startDate?: string;
    days: number;
    startTime: string;
    endTime: string;
    fee: number;
  };
  payment?: PaymentInput;
};

export type RenewalInput = {
  days: number;
  fee: number;
  startDate?: string;
  seatId?: number;
  startTime?: string;
  endTime?: string;
  payment?: PaymentInput;
};

const base = (libraryId: number) => `/libraries/${libraryId}/students`;

export const studentsApi = {
  async list(libraryId: number, params: { status: StudentStatusFilter; search?: string; page: number }) {
    const res = await request<StudentListItem[]>("GET", base(libraryId), {
      query: { ...params, limit: 20 },
    });
    return { items: res.data, meta: res.meta as PageMeta };
  },
  get: (libraryId: number, studentId: number) => api.get<StudentDetail>(`${base(libraryId)}/${studentId}`),
  create: (libraryId: number, input: NewStudentInput) =>
    api.post<{ student: StudentDetail; receipt: Receipt | null }>(base(libraryId), input),
  update: (libraryId: number, studentId: number, input: { name?: string; phone?: string }) =>
    api.patch<StudentDetail>(`${base(libraryId)}/${studentId}`, input),
  remove: (libraryId: number, studentId: number) => api.delete(`${base(libraryId)}/${studentId}`),
  renew: (libraryId: number, studentId: number, input: RenewalInput) =>
    api.post<{ student: StudentDetail; receipt: Receipt | null }>(`${base(libraryId)}/${studentId}/renewals`, input),
};
