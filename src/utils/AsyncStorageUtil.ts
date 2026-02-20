import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveLibraryData = async libraryData => {
  try {
    const jsonLibraryData = JSON.stringify(libraryData);
    await AsyncStorage.setItem('library-data', jsonLibraryData);
  } catch (error) {
    console.error('Error saving library data in async storage', error);
  }
};

export const getLibraryData = async () => {
  try {
    const jsonLibraryData = await AsyncStorage.getItem('library-data');
    return jsonLibraryData != null ? JSON.parse(jsonLibraryData) : null;
  } catch (error) {
    console.error('Error reading library data', error);
  }
};

export const clearLibraryData = async () => {
  try {
    await AsyncStorage.removeItem('library-data');
  } catch (error) {
    console.error('Error clearing auth data', error);
  }
};
