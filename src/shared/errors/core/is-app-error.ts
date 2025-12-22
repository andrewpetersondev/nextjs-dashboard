import { AppError } from "@/shared/errors/core/app-error";

/**
 * Checks whether a value is an `AppError`.
 *
 * @param val - The value to check.
 * @returns `true` if `val` is an instance of `AppError`, otherwise `false`.
 */
export function isAppError(val: unknown): val is AppError {
  return val instanceof AppError;
}
