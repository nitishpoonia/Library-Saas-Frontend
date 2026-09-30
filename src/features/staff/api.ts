import { api } from "@/api/client";
import type { StaffMember } from "@/api/types";

export type NewStaffInput = { name: string; phone: string; email?: string; password?: string; role: "MANAGER" | "STAFF" };

const base = (libraryId: number) => `/libraries/${libraryId}/staff`;

export const staffApi = {
  list: (libraryId: number) => api.get<StaffMember[]>(base(libraryId)),
  add: (libraryId: number, input: NewStaffInput) => api.post<StaffMember>(base(libraryId), input),
  changeRole: (libraryId: number, staffId: number, role: "MANAGER" | "STAFF") =>
    api.patch<StaffMember>(`${base(libraryId)}/${staffId}`, { role }),
  remove: (libraryId: number, staffId: number) => api.delete(`${base(libraryId)}/${staffId}`),
};
