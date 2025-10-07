// src/shared/core/errors/guards/error-guards.ts
import { BaseError } from "@/shared/core/errors/base/base-error";
import type { ErrorCode } from "@/shared/core/errors/base/error-codes";
import {
  type ConflictError,
  type ForbiddenError,
  type NotFoundError,
  type UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";

/**
 * Narrow unknown to BaseError.
 * @param e - unknown value
 */
export const isBaseError = (e: unknown): e is BaseError =>
  e instanceof BaseError;

/**
 * Narrow unknown to ValidationError.
 * @param e - unknown value
 */
export const isValidationError = (e: unknown): e is ValidationError =>
  e instanceof ValidationError;

/**
 * True when error is retryable.
 * @param e - unknown value
 */
export const isRetryableError = (e: unknown): e is BaseError =>
  e instanceof BaseError && e.retryable;

/**
 * Generic guard for a specific canonical error code.
 * @param e - unknown value
 * @param code - target error code literal
 */
export const isErrorWithCode = <C extends ErrorCode>(
  e: unknown,
  code: C,
): e is BaseError & { code: C } => isBaseError(e) && e.code === code;

/**
 * Guard by HTTP status code (derived from metadata).
 * @param e - unknown value
 * @param status - expected HTTP status
 */
export const isHttpStatusError = (
  e: unknown,
  status: number,
): e is BaseError & { statusCode: typeof status } =>
  isBaseError(e) && e.statusCode === status;

/**
 * NotFoundError (404 / NOT_FOUND).
 */
export const isNotFoundError = (e: unknown): e is NotFoundError =>
  isErrorWithCode(e, "NOT_FOUND");

/**
 * UnauthorizedError (401 / UNAUTHORIZED).
 */
export const isUnauthorizedError = (e: unknown): e is UnauthorizedError =>
  isErrorWithCode(e, "UNAUTHORIZED");

/**
 * ForbiddenError (403 / FORBIDDEN).
 */
export const isForbiddenError = (e: unknown): e is ForbiddenError =>
  isErrorWithCode(e, "FORBIDDEN");

/**
 * ConflictError (409 / CONFLICT).
 */
export const isConflictError = (e: unknown): e is ConflictError =>
  isErrorWithCode(e, "CONFLICT");
