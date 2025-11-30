// src/shared/errors/core/base-error.normalizer.ts
import { BaseError } from "@/shared/errors/core/base-error";
import type { AppErrorKey } from "@/shared/errors/core/registry";

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
