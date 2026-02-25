import { useQuery } from '@tanstack/react-query';
import {
  getListofExpiringSoonStudens,
  getListofOverdueStudents,
} from '../helpfulInfoServices/helpfulInfoService';

export const useFetchListOfOverdueStudents = () => {
  return useQuery({
    queryKey: ['overdueList'],
    queryFn: getListofOverdueStudents,
  });
};

export const useFetchListOfExpiringSoon = () => {
  return useQuery({
    queryKey: ['expiringList'],
    queryFn: getListofExpiringSoonStudens,
  });
};
