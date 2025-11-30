// src/shared/errors/core/error-codes.ts

import { APPLICATION_ERRORS } from "@/shared/errors/core/application/application-errors";
import { AUTH_ERRORS } from "@/shared/errors/core/auth-errors";
import { CORE_ERRORS } from "@/shared/errors/core/core-errors";
import { DOMAIN_ERRORS } from "@/shared/errors/core/domain/domain-errors";
import type {
  AppErrorDefinition,
  AppErrorLayer,
} from "@/shared/errors/core/error-types";
import { HTTP_ERRORS } from "@/shared/errors/core/http-errors";
import { INFRA_ERRORS } from "@/shared/errors/core/infra/infra-errors";
import { PRESENTATION_ERRORS } from "@/shared/errors/core/presentation/presentation-errors";
import { VALIDATION_ERRORS } from "@/shared/errors/core/validation-errors";

/**
 * Canonical, transport-agnostic error code registry.
 *
 * NOTE: No HTTP status, no "client/server/infrastructure" responsibility here.
 * Those live in adapter layers (e.g. HTTP, message-bus) that map from codes.
 */
export const APP_ERROR_MAP = {
  ...APPLICATION_ERRORS,
  ...AUTH_ERRORS,
  ...CORE_ERRORS,
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

/**
 * Layer-based helpers for branching error-handling logic.
 *
 * These are intentionally shallow predicates over the canonical metadata.
 */

export function isInfraErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "INFRA";
}

export function isCoreErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "CORE";
}

export function isHttpErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "HTTP";
}

export function isAuthErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "AUTH";
}

export function isValidationErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "VALIDATION";
}

export function isDomainErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "DOMAIN";
}

export function isApplicationErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "APPLICATION";
}

export function isPresentationErrorCode(code: AppErrorKey): boolean {
  return getAppErrorLayer(code) === "PRESENTATION";
}
