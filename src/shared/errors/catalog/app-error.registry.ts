import {
  API_ERRORS,
  AUTH_ERRORS,
  DOMAIN_ERRORS,
  INFRASTRUCTURE_ERRORS,
  SYSTEM_ERRORS,
  VALIDATION_ERRORS,
} from "@/shared/errors/catalog/app-error.codes";

export const APP_ERROR_MAP = {
  ...API_ERRORS,
  ...AUTH_ERRORS,
  ...DOMAIN_ERRORS,
  ...INFRASTRUCTURE_ERRORS,
  ...SYSTEM_ERRORS,
  ...VALIDATION_ERRORS,
} as const;

/**
 * Automatically derived from the keys of APP_ERROR_MAP.
 * No more manual union maintenance!
 */
export type AppErrorKey = keyof typeof APP_ERROR_MAP;

export type AppErrorMeta = (typeof APP_ERROR_MAP)[AppErrorKey];

// Helper for runtime checks without Object.keys overhead
export const APP_ERROR_KEYS = Object.freeze(
  Object.fromEntries(Object.keys(APP_ERROR_MAP).map((k) => [k, k])),
) as { [K in AppErrorKey]: K };

/**
 * Returns the schema/metadata for a given error code.
 */
export function getAppErrorCodeMeta(code: AppErrorKey): AppErrorMeta {
  return APP_ERROR_MAP[code];
}
