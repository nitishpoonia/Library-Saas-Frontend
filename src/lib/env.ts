/**
 * Build-time settings. EXPO_PUBLIC_* variables are inlined into the app when it's
 * bundled, so they're visible to anyone with the app: never put secrets here.
 */
const PRODUCTION_API_URL = "https://libaray-saas-backend.onrender.com/v1";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? PRODUCTION_API_URL).replace(/\/+$/, "");
