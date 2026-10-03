import { apiClientWithAuth, ENDPOINTS } from '../../../constants/api';

export const fetchDashboardData = async (libraryId: number) => {
  try {
    const response = await apiClientWithAuth.get(
      ENDPOINTS.DASHBOARD.OVERVIEW(libraryId),
    );
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
    return response.data;
  } catch (error) {
    console.error('Error fetching libraries:', error);
  }
};
