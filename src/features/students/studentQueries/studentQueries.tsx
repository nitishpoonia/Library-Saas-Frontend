import { queryClient } from '../../../../index';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  addStudent,
  deleteStudent,
  getStudentList,
  getAvailableSeats,
} from '../service/studentService';

export function useAddStudent() {
  console.log('Inside the useAddStudent');

  return useMutation({
    mutationFn: payload => addStudent(payload),
    onSuccess: variables => {
      queryClient.invalidateQueries({
        queryKey: ['dashboardOverview', variables.library_id],
      });
    },
  });
}

export function useGetStudents(libraryId: number) {
  return useQuery({
    queryKey: ['students', libraryId],
    queryFn: () => getStudentList(libraryId),
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
