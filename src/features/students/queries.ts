import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/api/keys";
import { studentsApi, type NewStudentInput, type RenewalInput, type StudentStatusFilter } from "./api";

/**
 * After any change to a student, membership or payment, everything cached for the
 * branch is refreshed: lists, details, dashboard, availability (REVIEW FD2). One rule
 * in one place, instead of each screen remembering which lists to reload.
 */
export function useRefreshBranch(libraryId: number) {
  const queryClient = useQueryClient();
  // Not returned on purpose: a mutation's onSuccess that returns a promise is awaited
  // before the screen's own callbacks run, so the button would keep spinning until every
  // open list and the dashboard had refetched. The refetch still happens, in the background.
  return () => {
    void queryClient.invalidateQueries({ queryKey: keys.library(libraryId) });
  };
}

export function useStudents(libraryId: number, status: StudentStatusFilter, search: string) {
  return useInfiniteQuery({
    queryKey: keys.students(libraryId, { status, search }),
    queryFn: ({ pageParam }) => studentsApi.list(libraryId, { status, search, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.hasNextPage ? last.meta.page + 1 : undefined),
  });
}

export function useStudent(libraryId: number, studentId: number) {
  return useQuery({
    queryKey: keys.student(libraryId, studentId),
    queryFn: () => studentsApi.get(libraryId, studentId),
  });
}

export function useCreateStudent(libraryId: number) {
  const refresh = useRefreshBranch(libraryId);
  return useMutation({
    mutationFn: (input: NewStudentInput) => studentsApi.create(libraryId, input),
    onSuccess: refresh,
  });
}

export function useUpdateStudent(libraryId: number, studentId: number) {
  const refresh = useRefreshBranch(libraryId);
  return useMutation({
    mutationFn: (input: { name?: string; phone?: string }) => studentsApi.update(libraryId, studentId, input),
    onSuccess: refresh,
  });
}

export function useRemoveStudent(libraryId: number, studentId: number) {
  const refresh = useRefreshBranch(libraryId);
  return useMutation({ mutationFn: () => studentsApi.remove(libraryId, studentId), onSuccess: refresh });
}

export function useRenewMembership(libraryId: number, studentId: number) {
  const refresh = useRefreshBranch(libraryId);
  return useMutation({
    mutationFn: (input: RenewalInput) => studentsApi.renew(libraryId, studentId, input),
    onSuccess: refresh,
  });
}
