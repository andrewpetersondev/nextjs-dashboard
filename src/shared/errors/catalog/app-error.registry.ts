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
export type AppErrorMeta = (typeof APP_ERROR_MAP)[AppErrorKey];

/**
 * Return metadata for a code.
 */
export function getAppErrorCodeMeta(code: AppErrorKey): AppErrorMeta {
  return APP_ERROR_MAP[code];
}
