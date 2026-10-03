import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { keys } from "@/api/keys";
import { useRefreshBranch } from "../students/queries";
import { seatAdminApi, seatsApi, type AvailabilityQuery } from "./api";

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

export function useSeats(libraryId: number) {
  return useQuery({ queryKey: keys.seats(libraryId), queryFn: () => seatAdminApi.list(libraryId) });
}

export function useSeatMutations(libraryId: number) {
  const refresh = useRefreshBranch(libraryId);
  return {
    add: useMutation({ mutationFn: (input: { count: number } | { label: string }) => seatAdminApi.add(libraryId, input), onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ seatId, ...input }: { seatId: number; label?: string; hasLocker?: boolean }) =>
        seatAdminApi.update(libraryId, seatId, input),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: (seatId: number) => seatAdminApi.remove(libraryId, seatId), onSuccess: refresh }),
  };
}
