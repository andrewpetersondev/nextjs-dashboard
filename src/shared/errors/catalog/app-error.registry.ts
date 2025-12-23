import { APP_ERROR_DEFINITIONS } from "@/shared/errors/catalog/app-error.codes";

/**
 * Automatically derived union of all valid error codes.
 * No more manual maintenance of AppErrorKeyUnion!
 */
export type AppErrorKey = keyof typeof APP_ERROR_DEFINITIONS;

export type AppErrorMeta = (typeof APP_ERROR_DEFINITIONS)[AppErrorKey];

export const APP_ERROR_KEYS = Object.freeze(
  Object.fromEntries(Object.keys(APP_ERROR_DEFINITIONS).map((k) => [k, k])),
) as { [K in AppErrorKey]: K };

export function getAppErrorCodeMeta(code: AppErrorKey): AppErrorMeta {
  return APP_ERROR_DEFINITIONS[code];
}
