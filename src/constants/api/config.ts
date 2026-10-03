// Central API configuration with environment-aware base URL

// const DEV_DEFAULT = 'http://192.168.31.156:4000';
const DEV_DEFAULT = 'http://localhost:4000';
const PROD_DEFAULT = 'https://libaray-saas-backend.onrender.com';
const IS_DEV = false;
function getBaseUrl(): string {

  return IS_DEV ? DEV_DEFAULT : PROD_DEFAULT;
}

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  // TIMEOUT: 15000,
};

export type ApiConfig = typeof API_CONFIG;
