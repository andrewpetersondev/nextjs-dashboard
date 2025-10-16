import { BaseError, isBaseError } from "@/shared/core/errors/base/base-error";
import type { ErrorCode } from "@/shared/core/errors/base/error-codes";

/**
 * True when error is retryable.
 * @param e - unknown value
 */
export const isRetryableError = (
  e: unknown,
): e is BaseError & { readonly retryable: true } =>
  e instanceof BaseError && e.retryable === true;

/**
 * Generic guard for a specific canonical error code.
 * @param e - unknown value
 * @param code - target error code literal
 */
export const isErrorWithCode = <C extends ErrorCode>(
  e: unknown,
  code: C,
): e is BaseError & { code: C } => isBaseError(e) && e.code === code;
