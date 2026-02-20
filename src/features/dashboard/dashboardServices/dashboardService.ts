import { apiClientWithAuth, ENDPOINTS } from '../../../constants/api';

export const fetchDashboardData = async (libraryId: number) => {
  try {
    const response = await apiClientWithAuth.get(
      ENDPOINTS.DASHBOARD.OVERVIEW(libraryId),
    );
    console.log('Dashboard data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

export const getAllLibraries = async () => {
  try {
    const response = await apiClientWithAuth.get(
      ENDPOINTS.LIBRARIES.ALL_LIBRARIES,
    );
    console.log('Libraries fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching libraries:', error);
  }
};
