import { queryClient } from '../../../../index';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import {
  addStudent,
  deleteStudent,
  getStudentDetail,
  getStudentList,
  getAvailableSeats,
  updateStudent,
  renewMembership,
} from '../service/studentService';

export function useAddStudent() {
  return useMutation({
    mutationFn: (payload: any) => addStudent(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['dashboardOverview', variables.library_id],
      });
    },
  });
}

export function useGetStudents(libraryId: number, search: string) {
  return useInfiniteQuery({
    queryKey: ['students', libraryId, search],
    queryFn: ({ pageParam = 1 }) =>
      getStudentList(libraryId, pageParam, search),
    getNextPageParam: lastPage => {
      return lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!libraryId,
  });
}

export function useDeleteStudent() {
  return useMutation({
    mutationFn: (studentId: string) => deleteStudent(studentId),
    onError: error => {
      console.log('Error deleting student', error);
    },
  });
}

export const useGetAvailableSeats = ({
  libraryId,
  dataForGettingAvailableSeats,
}) => {
  const isEnabled =
    Boolean(libraryId) &&
    Boolean(dataForGettingAvailableSeats?.startTime) &&
    Boolean(dataForGettingAvailableSeats?.endTime) &&
    Boolean(dataForGettingAvailableSeats?.bookedFor);
  return useQuery({
    queryKey: ['availableSeats', libraryId, dataForGettingAvailableSeats],
    queryFn: () =>
      getAvailableSeats({
        libraryId,
        dataForGettingAvailableSeats,
      }),
    enabled: isEnabled,
  });
};

export function useGetStudentDetail(libraryId: number, studentId: number) {
  return useQuery({
    queryKey: ['studentDetail', libraryId, studentId],
    queryFn: () => getStudentDetail(libraryId, studentId),
    enabled: !!libraryId && !!studentId,
  });
}

export function useUpdateStudent() {
  return useMutation({
    mutationFn: ({ libraryId, studentId, studentData }: any) =>
      updateStudent(libraryId, studentId, studentData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['students', variables.libraryId],
      });
      queryClient.invalidateQueries({
        queryKey: ['studentDetail', variables.libraryId, variables.studentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboardOverview', variables.libraryId],
      });
    },
  });
}

export function useRenewMembership() {
  return useMutation({
    mutationFn: ({ libraryId, payload }: any) =>
      renewMembership(libraryId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['students', variables.libraryId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'studentDetail',
          variables.libraryId,
          variables.payload?.student_id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboardOverview', variables.libraryId],
      });
    },
  });
}
