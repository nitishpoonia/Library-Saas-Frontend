import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { keys } from "@/api/keys";
import type { Library } from "@/api/types";
import { useRefreshBranch } from "../students/queries";

export type ProfileInput = { name?: string; email?: string; phone?: string; notificationsEnabled?: boolean };

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => api.patch("/me", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.me }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) => api.post("/me/password", input),
  });
}

export function useUpdateLibrary(libraryId: number) {
  const queryClient = useQueryClient();
  const refresh = useRefreshBranch(libraryId);
  return useMutation({
    mutationFn: (input: { name?: string; address?: string; gracePeriodDays?: number }) =>
      api.patch<Library>(`/libraries/${libraryId}`, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.me });
      await refresh();
    },
  });
}
