import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { keys } from "@/api/keys";
import { seatsApi, type AvailabilityQuery } from "./api";

/** Which seats are free for a period and daily time. Only runs once all inputs are valid. */
export function useSeatAvailability(libraryId: number, query: AvailabilityQuery | null) {
  return useQuery({
    queryKey: keys.availability(libraryId, (query ?? {}) as Record<string, string | number>),
    queryFn: () => seatsApi.availability(libraryId, query!),
    enabled: query !== null,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
