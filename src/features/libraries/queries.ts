import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/api/keys";
import { librariesApi } from "./api";

export function useDashboard(libraryId: number, month?: string) {
  return useQuery({
    queryKey: keys.dashboard(libraryId, month),
    queryFn: () => librariesApi.dashboard(libraryId, month),
  });
}

export function useCreateLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: librariesApi.create,
    // The new branch shows up in /me, which drives the branch list.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.me }),
  });
}
