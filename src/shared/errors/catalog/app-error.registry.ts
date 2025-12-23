import {
  API_ERRORS,
  AUTH_ERRORS,
  DOMAIN_ERRORS,
  INFRASTRUCTURE_ERRORS,
  SYSTEM_ERRORS,
  VALIDATION_ERRORS,
} from "@/shared/errors/catalog/app-error.codes";
import type { AppErrorSchema } from "@/shared/errors/core/app-error.schema";

export type AppErrorKeyUnion =
  | "conflict"
  | "not_found"
  | "parse"
  | "forbidden"
  | "invalid_credentials"
  | "unauthorized"
  | "application_error"
  | "domain_error"
  | "presentation_error"
  | "database"
  | "infrastructure"
  | "integrity"
  | "unexpected"
  | "unknown"
  | "missing_fields"
  | "validation";

export const APP_ERROR_MAP = {
  ...API_ERRORS,
  ...AUTH_ERRORS,
  ...DOMAIN_ERRORS,
  ...INFRASTRUCTURE_ERRORS,
  ...SYSTEM_ERRORS,
  ...VALIDATION_ERRORS,
} as const satisfies Record<AppErrorKeyUnion, AppErrorSchema>;

export type AppErrorRegistry = typeof APP_ERROR_MAP;

export type AppErrorKey = keyof AppErrorRegistry;

export type AppErrorMeta = AppErrorRegistry[AppErrorKey];

export const APP_ERROR_KEYS = Object.freeze(
  Object.fromEntries(
    Object.keys(APP_ERROR_MAP).map((key: string) => [key, key]),
  ) as {
    [K in AppErrorKey]: K;
  },
);

export function getAppErrorCodeMeta(code: AppErrorKey): AppErrorMeta {
  return APP_ERROR_MAP[code];
}
