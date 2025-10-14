// src/shared/core/errors/guards/error-guards.ts
import { BaseError, isBaseError } from "@/shared/core/errors/base/base-error";
import type { ErrorCode } from "@/shared/core/errors/base/error-codes";

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
