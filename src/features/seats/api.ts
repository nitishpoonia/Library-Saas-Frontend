import { request } from "@/api/client";
import type { SeatAvailability } from "@/api/types";

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
