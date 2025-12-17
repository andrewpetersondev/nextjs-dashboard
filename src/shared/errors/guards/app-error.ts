import { AppError } from "@/shared/errors/core/app-error";

/**
 * Type guard for narrowing to `AppError`.
 * @remarks use `AppError.isAppError(error)` instead.
 */
export function isAppError(error: unknown): error is AppError {
  return AppError.isAppError(error);
}
