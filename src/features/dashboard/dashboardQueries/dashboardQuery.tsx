import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardData,
  getAllLibraries,
} from '../dashboardServices/dashboardService';

export function useGetDashboardOverview(libraryId: number) {
  return useQuery({
    queryKey: ['dashboardOverview', libraryId],
    queryFn: () => fetchDashboardData(libraryId),
    enabled: !!libraryId,
  });
}

export function useGetAllLibraries() {
  return useQuery({
    queryKey: ['allLibraries'],
    queryFn: getAllLibraries,
  });
}
