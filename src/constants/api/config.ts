// Central API configuration with environment-aware base URL

// const DEV_DEFAULT = 'http://192.168.31.156:4000';
const DEV_DEFAULT = 'http://localhost:4000';
const PROD_DEFAULT = 'https://libaray-saas-backend.onrender.com';
const IS_DEV = false;
function getBaseUrl(): string {
  console.log('IS dev', IS_DEV);

  return IS_DEV ? DEV_DEFAULT : PROD_DEFAULT;
}
console.log('Base url', getBaseUrl());

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  // TIMEOUT: 15000,
};
console.log('API config', API_CONFIG);

export type ApiConfig = typeof API_CONFIG;
