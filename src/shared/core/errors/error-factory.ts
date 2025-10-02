import { BaseError } from "@/shared/core/errors/base";
import { type ErrorCode, isErrorCode } from "@/shared/core/errors/error-codes";

export interface CreateErrorParams {
  code: ErrorCode;
  message?: string;
  context?: Record<string, unknown>;
  cause?: unknown;
}

export function createError(params: CreateErrorParams): BaseError {
  const { code, message, context = {}, cause } = params;
  return new BaseError(code, message, context, cause);
}

/**
 * Defensive factory when code comes from external or dynamic sources.
 * Falls back to UNKNOWN if invalid.
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
    {
      ...context,
      originalCode: code,
    },
    cause,
  );
}
