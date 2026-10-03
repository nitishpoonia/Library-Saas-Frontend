import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { keys } from "@/api/keys";
import type { Library, Me } from "@/api/types";
import { useRefreshBranch } from "../students/queries";

export type ProfileInput = { name?: string; email?: string; phone?: string; notificationsEnabled?: boolean };

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => api.patch("/me", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.me }),
  });
}

/**
 * The daily-summary switch. Updated optimistically: a Switch whose value comes from the
 * server would snap back on tap and only flip once the PATCH and the /me refetch finish.
 * If the PATCH fails, the old value is put back.
 */
export function useSetNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => api.patch("/me", { notificationsEnabled: enabled }),
    onMutate: async (enabled) => {
      await queryClient.cancelQueries({ queryKey: keys.me });
      const previous = queryClient.getQueryData<Me>(keys.me);
      if (previous) {
        queryClient.setQueryData<Me>(keys.me, { ...previous, user: { ...previous.user, notificationsEnabled: enabled } });
      }
      return { previous };
    },
    onError: (_error, _enabled, context) => {
      if (context?.previous) queryClient.setQueryData(keys.me, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.me });
    },
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
