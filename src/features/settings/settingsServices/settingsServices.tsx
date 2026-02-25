import { apiClientWithAuth, ENDPOINTS } from '../../../constants/api';

export const getUserProfile = async () => {
  try {
    const response = await apiClientWithAuth(
      ENDPOINTS.PROFILE.GET_USER_PROFILE,
    );
    console.log('Response for user profile', response);

    return response.data;
  } catch (error) {
    console.error('Error getting profile', error);
  }
};

export const updateUserProfile = async updateData => {
  console.log('updaet dagta in service', updateData);

  try {
    const response = await apiClientWithAuth.patch(
      ENDPOINTS.PROFILE.UPDATE_USER_PROFILE,
      updateData,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating profile', error.response.data.error);
    throw new Error(error?.response?.data?.error);
  }
};

export const udpatePassword = async passwordData => {
  try {
    const response = await apiClientWithAuth.patch(
      ENDPOINTS.PROFILE.CHANGE_PASSWORD,
      passwordData,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating password', error.response.data.error, error);
    throw new Error(error?.response?.data?.error);
  }
};

export const getLibraryDetails = async libraryId => {
  try {
    const response = await apiClientWithAuth.get(
      ENDPOINTS.LIBRARIES.OVERVIEW(libraryId),
    );
    return response?.data;
  } catch (error) {
    console.error('Error getting library details', error.response.data.error);
    throw new Error(error?.response?.data?.error);
  }
};

export const updateLibraryDetails = async libraryUpdateData => {
  try {
    const response = await apiClientWithAuth.patch(
      ENDPOINTS.LIBRARIES.UPDATE_LIBRARY,
      libraryUpdateData,
    );
    return response?.data;
  } catch (error) {
    console.error('Error updating library details', error.response.data.error);
    throw new Error(error?.response?.data?.error);
  }
};
