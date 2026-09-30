import { api, request } from "@/api/client";
import type { Seat, SeatAvailability } from "@/api/types";

export type AvailabilityQuery = { startDate?: string; days: number; startTime: string; endTime: string };

export const seatsApi = {
  async availability(libraryId: number, query: AvailabilityQuery) {
    const res = await request<SeatAvailability[]>("GET", `/libraries/${libraryId}/seats/availability`, { query });
    return {
      seats: res.data,
      meta: res.meta as { period: { startDate: string; endDate: string }; totalSeats: number; availableCount: number },
    };
  },
};

export const seatAdminApi = {
  list: (libraryId: number) => api.get<Seat[]>(`/libraries/${libraryId}/seats`),
  add: (libraryId: number, input: { count: number } | { label: string }) =>
    api.post<Seat[]>(`/libraries/${libraryId}/seats`, input),
  update: (libraryId: number, seatId: number, input: { label?: string; hasLocker?: boolean }) =>
    api.patch<Seat>(`/libraries/${libraryId}/seats/${seatId}`, input),
  remove: (libraryId: number, seatId: number) => api.delete(`/libraries/${libraryId}/seats/${seatId}`),
};
