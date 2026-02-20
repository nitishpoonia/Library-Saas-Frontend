import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'LibraryApp';

export interface AuthData {
  token: string;
  isLibraryCreated: boolean;
}

export const saveAuthData = async (
  token: string,
  isLibraryCreated: boolean,
): Promise<boolean> => {
  try {
    const authData: AuthData = {
      token,
      isLibraryCreated,
    };

    await Keychain.setGenericPassword('auth', JSON.stringify(authData), {
      service: SERVICE_NAME,
    });
    return true;
  } catch (error) {
    console.error('Error saving auth data to keychain:', error);
    return false;
  }
};

/**
 * Retrieve authentication data from keychain
 */
export const getAuthData = async (): Promise<AuthData | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });

    if (credentials) {
      const authData: AuthData = JSON.parse(credentials.password);
      return authData;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving auth data from keychain:', error);
    return null;
  }
};

/**
 * Clear authentication data from keychain
 */
export const clearAuthData = async (): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({
      service: SERVICE_NAME,
    });
    return true;
  } catch (error) {
    console.error('Error clearing auth data from keychain:', error);
    return false;
  }
};

/**
 * Update only the isLibraryCreated flag in keychain
 */
export const updateLibraryCreatedFlag = async (
  isLibraryCreated: boolean,
): Promise<boolean> => {
  try {
    const authData = await getAuthData();
    if (authData) {
      return await saveAuthData(authData.token, isLibraryCreated);
    }
    return false;
  } catch (error) {
    console.error('Error updating library created flag:', error);
    return false;
  }
};
