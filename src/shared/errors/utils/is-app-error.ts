import { AppError } from "@/shared/errors/core/app-error.entity";
import type { AppErrorJsonDto } from "@/shared/errors/core/app-error-json.dto";

/**
 * Checks whether a value is an `AppError` instance.
 *
 * @param val - The value to check.
 * @returns `true` if `val` is an instance of `AppError`, otherwise `false`.
 */
export function isAppError(val: unknown): val is AppError {
  return val instanceof AppError;
}

/**
 * Checks whether a value is a plain object representation of an `AppError`.
 * Useful for validating data received across boundaries (e.g., from a Server Action).
 *
 * @param val - The value to check.
 * @returns `true` if `val` matches the shape of an `AppErrorJsonDto`, otherwise `false`.
 */
export function isAppErrorJson(val: unknown): val is AppErrorJsonDto {
  if (typeof val !== "object" || val === null) {
    return false;
  }

  const candidate = val as Record<string, unknown>;

  return (
    candidate._isAppError === true &&
    typeof candidate.key === "string" &&
    typeof candidate.message === "string"
  );
}
