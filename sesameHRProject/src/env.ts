/// <reference types="vite/client" />

export const ENV_VARIABLES = {
  PUBLIC_API_TOKEN: import.meta.env.PUBLIC_API_TOKEN ?? '',
  PUBLIC_VACANCY_ID: import.meta.env.PUBLIC_VACANCY_ID ?? '',
  PUBLIC_BASE_API_URL: import.meta.env.PUBLIC_BASE_API_URL ?? '',
};
