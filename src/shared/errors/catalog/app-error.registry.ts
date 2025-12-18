import {
  API_ERRORS,
  AUTH_ERRORS,
  DOMAIN_ERRORS,
  INFRASTRUCTURE_ERRORS,
  SYSTEM_ERRORS,
  VALIDATION_ERRORS,
} from "@/shared/errors/catalog/app-error.definitions";
import type { AppErrorDefinition } from "@/shared/errors/core/app-error.definitions";

/**
 * Canonical, transport-agnostic error code registry.
 *
 * NOTE: No HTTP status, no "client/server/infrastructure" responsibility here.
 * Those live in adapter layers (e.g. HTTP, message-bus) that map from codes.
 */
export const APP_ERROR_MAP = {
  ...API_ERRORS,
  ...AUTH_ERRORS,
  ...DOMAIN_ERRORS,
  ...INFRASTRUCTURE_ERRORS,
  ...SYSTEM_ERRORS,
  ...VALIDATION_ERRORS,
} as const satisfies Record<string, AppErrorDefinition>;

export type AppErrorKey = keyof typeof APP_ERROR_MAP;

/**
 * Registry of literal error keys for strict type safety in adapters.
 * Derived directly from APP_ERROR_MAP to ensure zero-drift synchronization.
 */
export const APP_ERROR_KEYS = Object.freeze(
  Object.fromEntries(Object.keys(APP_ERROR_MAP).map((key) => [key, key])) as {
    [K in AppErrorKey]: K;
  },
);

export type AppErrorMeta = (typeof APP_ERROR_MAP)[AppErrorKey];

/**
 * Return metadata for a code.
 */
export function getAppErrorCodeMeta(code: AppErrorKey): AppErrorMeta {
  return APP_ERROR_MAP[code];
}
