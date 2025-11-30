// src/shared/errors/registry.ts
import { APPLICATION_ERRORS } from "@/shared/errors/definitions/application";
import { AUTH_ERRORS } from "@/shared/errors/definitions/auth";
import { DOMAIN_ERRORS } from "@/shared/errors/definitions/domain";
import { HTTP_ERRORS } from "@/shared/errors/definitions/http";
import { INFRA_ERRORS } from "@/shared/errors/definitions/infra";
import { PRESENTATION_ERRORS } from "@/shared/errors/definitions/presentation";
import { SYSTEM_ERRORS } from "@/shared/errors/definitions/system";
import { VALIDATION_ERRORS } from "@/shared/errors/definitions/validation";
import type { AppErrorDefinition, AppErrorLayer } from "@/shared/errors/types";

/**
 * Canonical, transport-agnostic error code registry.
 *
 * NOTE: No HTTP status, no "client/server/infrastructure" responsibility here.
 * Those live in adapter layers (e.g. HTTP, message-bus) that map from codes.
 */
export const APP_ERROR_MAP = {
  ...APPLICATION_ERRORS,
  ...AUTH_ERRORS,
  ...SYSTEM_ERRORS,
  ...DOMAIN_ERRORS,
  ...HTTP_ERRORS,
  ...INFRA_ERRORS,
  ...PRESENTATION_ERRORS,
  ...VALIDATION_ERRORS,
} as const satisfies Record<string, AppErrorDefinition>;

export type AppErrorKey = keyof typeof APP_ERROR_MAP;
export type AppErrorMeta = (typeof APP_ERROR_MAP)[AppErrorKey];
export type AppCode = AppErrorKey;

export const APP_CODE_TO_META: Record<AppCode, AppErrorMeta> = APP_ERROR_MAP;

/**
 * Return metadata for a code.
 */
export function getAppErrorCodeMeta(code: AppErrorKey): AppErrorMeta {
  return APP_ERROR_MAP[code];
}

/**
 * Return the logical layer for a given error code.
 */
export function getAppErrorLayer(code: AppErrorKey): AppErrorLayer {
  return APP_ERROR_MAP[code].layer;
}

// Layer predicates
export function isDbErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "DB";
}

export function isInternalErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "INTERNAL";
}

export function isApiErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "API";
}

export function isSecurityErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "SECURITY";
}

export function isValidationErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "VALIDATION";
}

export function isDomainErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "DOMAIN";
}

export function isUiErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "UI";
}
