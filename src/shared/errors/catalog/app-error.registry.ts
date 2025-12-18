import {
  API_ERRORS,
  AUTH_ERRORS,
  DOMAIN_ERRORS,
  INFRASTRUCTURE_ERRORS,
  SYSTEM_ERRORS,
  VALIDATION_ERRORS,
} from "@/shared/errors/catalog/app-error.codes";
import type { AppErrorSchema } from "@/shared/errors/core/app-error.schema";

/**
 * Canonical, transport-agnostic error code registry.
 *
 * @remarks
 * This is the single source of truth for all application error codes. It does
 * not include HTTP status codes or protocol concerns; adapters are responsible
 * for mapping from these codes to transport-specific representations.
 */
export const APP_ERROR_MAP = {
  ...API_ERRORS,
  ...AUTH_ERRORS,
  ...DOMAIN_ERRORS,
  ...INFRASTRUCTURE_ERRORS,
  ...SYSTEM_ERRORS,
  ...VALIDATION_ERRORS,
} as const satisfies Record<string, AppErrorSchema>;

export type AppErrorRegistry = typeof APP_ERROR_MAP;

export type AppErrorKey = keyof AppErrorRegistry;

/**
 * Metadata for a given application error code.
 */
export type AppErrorMeta = AppErrorRegistry[AppErrorKey];

/**
 * Registry of literal error keys for strict type safety in adapters.
 *
 * @remarks
 * Derived directly from {@link APP_ERROR_MAP} to ensure zero-drift
 * synchronization between the registry and consumers.
 */
export const APP_ERROR_KEYS = Object.freeze(
  Object.fromEntries(
    Object.keys(APP_ERROR_MAP).map((key: string) => [key, key]),
  ) as {
    [K in AppErrorKey]: K;
  },
);

/**
 * Return metadata for a code.
 */
export function getAppErrorCodeMeta(code: AppErrorKey): AppErrorMeta {
  return APP_ERROR_MAP[code];
}
