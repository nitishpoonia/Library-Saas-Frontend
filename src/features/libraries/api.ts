import { api } from "@/api/client";
import type { Dashboard, Library } from "@/api/types";

export type NewLibraryInput = { name: string; address: string; seatCount: number };

export const librariesApi = {
  create: (input: NewLibraryInput) => api.post<{ id: number; name: string }>("/libraries", input),
  get: (libraryId: number) => api.get<Library>(`/libraries/${libraryId}`),
  dashboard: (libraryId: number, month?: string) =>
    api.get<Dashboard>(`/libraries/${libraryId}/dashboard`, { month }),
};
