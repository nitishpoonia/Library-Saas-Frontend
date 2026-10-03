import * as SecureStore from "expo-secure-store";

/**
 * What survives an app restart. The refresh token lives in the phone's keystore
 * (Keychain / Android Keystore). The access token is never stored: it's fetched
 * again with the refresh token when the app starts.
 */
const REFRESH_TOKEN = "session.refreshToken";
const LIBRARY_ID = "session.libraryId";

export const sessionStorage = {
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN),
  setRefreshToken: (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN, token),

  async getLibraryId(): Promise<number | null> {
    const value = await SecureStore.getItemAsync(LIBRARY_ID);
    return value ? Number(value) : null;
  },
  setLibraryId: (id: number) => SecureStore.setItemAsync(LIBRARY_ID, String(id)),

  async clear() {
    await Promise.all([
      SecureStore.deleteItemAsync(REFRESH_TOKEN),
      SecureStore.deleteItemAsync(LIBRARY_ID),
    ]);
  },
};
