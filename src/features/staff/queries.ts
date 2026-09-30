import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/api/keys";
import { staffApi, type NewStaffInput } from "./api";

export function useStaff(libraryId: number) {
  return useQuery({ queryKey: keys.staff(libraryId), queryFn: () => staffApi.list(libraryId) });
}

export function useStaffMutations(libraryId: number) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.staff(libraryId) });
  return {
    add: useMutation({ mutationFn: (input: NewStaffInput) => staffApi.add(libraryId, input), onSuccess: refresh }),
    changeRole: useMutation({
      mutationFn: ({ staffId, role }: { staffId: number; role: "MANAGER" | "STAFF" }) => staffApi.changeRole(libraryId, staffId, role),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: (staffId: number) => staffApi.remove(libraryId, staffId), onSuccess: refresh }),
  };
}
