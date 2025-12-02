import { AppError } from "@/shared/errors/core/app-error.class";
import type { AppErrorKey } from "@/shared/errors/registries/error-code.registry";

/**
 * Normalize an unknown value into a AppError using {@link AppError.from}.
 *
 * This is the preferred entry-point for converting arbitrary thrown values
 * into the canonical `AppError` type.
 */
export function normalizeToAppError(
  error: unknown,
  fallbackCode: AppErrorKey = "unknown",
): AppError {
  return AppError.from(error, fallbackCode);
}
