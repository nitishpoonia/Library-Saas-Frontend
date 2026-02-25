import { apiClientWithAuth, ENDPOINTS } from '../../../constants/api';

export const getListofOverdueStudents = async () => {
  try {
    const response = await apiClientWithAuth.get(
      ENDPOINTS.HELPFULINFO.OVERDUE_STUDENT_LIST,
    );
    console.log('Response', response);

    return response.data;
  } catch (error) {
    console.error('Error getting list of overdue students', error);
    throw new Error(error.response.data.error);
  }
};

export const getListofExpiringSoonStudens = async () => {
  try {
    const response = await apiClientWithAuth.get(
      ENDPOINTS.HELPFULINFO.EXPIRING_SOON,
    );
    console.log('Response', response);

    return response.data;
  } catch (error) {
    console.error('Error getting list of expiring soon students', error);
    throw new Error(error.response.data.error);
  }
};
