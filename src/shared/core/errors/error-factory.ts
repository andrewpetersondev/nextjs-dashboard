// src/shared/core/errors/error-factory.ts
import { BaseError } from "@/shared/core/errors/base-error";
import { type ErrorCode, isErrorCode } from "@/shared/core/errors/error-codes";

export interface CreateErrorParams {
  readonly code: ErrorCode;
  readonly message?: string;
  readonly context?: Record<string, unknown>;
  readonly cause?: unknown;
}

/**
 * Direct canonical error creation with defensive context freezing.
 */
export function createError(params: CreateErrorParams): BaseError {
  const { code, message, context = {}, cause } = params;
  return new BaseError(code, message, context, cause);
}

/**
 * Safe factory for dynamic/untrusted codes; falls back to UNKNOWN.
 */
export function safeCreateError(
  code: string,
  message?: string,
  context: Record<string, unknown> = {},
  cause?: unknown,
): BaseError {
  if (isErrorCode(code)) {
    return new BaseError(code, message, context, cause);
  }
  return new BaseError(
    "UNKNOWN",
    message || `Unrecognized error code: ${code}`,
    { ...context, originalCode: code },
    cause,
  );
}

/**
 * Convenience: normalize unknown into a BaseError (alias of BaseError.from).
 */
export function normalizeUnknown(
  value: unknown,
  context: Record<string, unknown> = {},
  fallback: ErrorCode = "UNKNOWN",
): BaseError {
  return BaseError.from(value, fallback, context);
}

export function createBaseError(params: CreateErrorParams): BaseError {
  return new BaseError(
    params.code,
    params.message,
    params.context ?? {},
    params.cause,
  );
}
