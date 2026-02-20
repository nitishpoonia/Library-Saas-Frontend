import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  saveAuthData,
  clearAuthData,
  updateLibraryCreatedFlag,
} from '../../../utils/Keychain';
import {
  clearLibraryData,
  saveLibraryData,
} from '../../../utils/AsyncStorageUtil';

export interface Owner {
  id?: number;
  name?: string;
  email?: string;
  [key: string]: any;
}

interface AuthState {
  owner: Owner;
  token: string | null;
  isLibraryCreated: boolean | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUpMessage: string | null;
  signUpError: string | null;
  signUpLoading: boolean;
  signInLoading: boolean;
  signInError: string | null;
  library: any;
}

const initialState: AuthState = {
  owner: {},
  token: null,
  isLibraryCreated: null,
  isAuthenticated: false,
  isLoading: true,
  signUpMessage: null,
  signUpError: null,
  signUpLoading: false,
  signInLoading: false,
  signInError: null,
  library: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Initialize auth state from keychain (called on app start)
    initializeAuth: (
      state,
      action: PayloadAction<{
        token: string;
        isLibraryCreated: boolean;
      } | null>,
    ) => {
      if (action.payload) {
        state.token = action.payload.token;
        state.isLibraryCreated = action.payload.isLibraryCreated;
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
      state.isLoading = false;
    },

    // Set loading state for initial auth check
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Sign Up actions
    setSignupLoading: (state, action: PayloadAction<boolean>) => {
      state.signUpLoading = action.payload;
    },

    setSignupData: (
      state,
      action: PayloadAction<{
        owner: Owner;
        token: string;
        message: string;
        isLibraryCreated: boolean;
      }>,
    ) => {
      state.owner = action.payload.owner;
      state.token = action.payload.token;
      state.signUpMessage = action.payload.message;
      state.isLibraryCreated = action.payload.isLibraryCreated;
      state.isAuthenticated = true;
      state.signUpError = null;
      state.signUpLoading = false;

      // Save to keychain
      saveAuthData(action.payload.token, action.payload.isLibraryCreated);
    },

    setSignupError: (state, action: PayloadAction<string>) => {
      console.log('action payload', action.payload);
      state.signUpError = action.payload;
      state.signUpLoading = false;
    },

    clearSignupError: state => {
      state.signUpError = null;
    },

    // Sign In actions
    setSignInLoading: (state, action: PayloadAction<boolean>) => {
      state.signInLoading = action.payload;
    },

    setSignInData: (
      state,
      action: PayloadAction<{
        owner: Owner;
        token: string;
        isLibraryCreated: boolean;
      }>,
    ) => {
      state.owner = action.payload.owner;
      state.token = action.payload.token;
      state.isLibraryCreated = action.payload.isLibraryCreated;
      state.isAuthenticated = true;
      state.signInError = null;
      state.signInLoading = false;

      saveAuthData(action.payload.token, action.payload.isLibraryCreated);
    },

    setSignInError: (state, action: PayloadAction<string>) => {
      state.signInError = action.payload;
      state.signInLoading = false;
    },

    clearSignInError: state => {
      state.signInError = null;
    },

    // Library setup completion
    setLibraryCreated: (state, action: PayloadAction<boolean>) => {
      state.isLibraryCreated = action.payload;

      if (state.token) {
        updateLibraryCreatedFlag(action.payload);
      }
    },
    saveLibraryData: (state, action) => {
      state.library = action.payload;
      saveLibraryData(action.payload);
    },

    // Logout
    logout: state => {
      state.owner = {};
      state.token = null;
      state.isLibraryCreated = null;
      state.isAuthenticated = false;
      state.signUpMessage = null;
      state.signUpError = null;
      state.signInError = null;

      clearAuthData();
      clearLibraryData();
    },
  },
});

export const {
  initializeAuth,
  setAuthLoading,
  setSignupData,
  setSignupLoading,
  setSignupError,
  clearSignupError,
  setSignInLoading,
  setSignInData,
  setSignInError,
  clearSignInError,
  setLibraryCreated,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
