// src/shared/errors/error.utils.ts
import { BaseError } from "@/shared/errors/base-error";
import type { AppErrorKey } from "@/shared/errors/error-codes";

/**
 * Normalize an unknown value into a BaseError using {@link BaseError.from}.
 *
 * This is the preferred entry-point for converting arbitrary thrown values
 * into the canonical `BaseError` type.
 */
export function normalizeToBaseError(
  error: unknown,
  fallbackCode: AppErrorKey = "unknown",
): BaseError {
  return BaseError.from(error, fallbackCode);
}
