import type { AppError } from "@/shared/errors/core/app-error.class";
import type {
  FormResult,
  FormSuccess,
} from "@/shared/forms/domain/types/form-result.types";
import type { Result } from "@/shared/result/result";

/**
 * Narrow to success branch.
 */
export const isFormOk = <T>(
  r: FormResult<T>,
): r is Result<FormSuccess<T>, never> => r.ok;

/**
 * Narrow to validation error branch.
 */
export const isFormErr = <T>(r: FormResult<T>): r is Result<never, AppError> =>
  !r.ok;

/**
 * Type guard to check if an AppError contains form validation details.
 */
export const isFormValidationError = (error: AppError): boolean =>
  error.code === "validation" &&
  error.metadata !== undefined &&
  "fieldErrors" in error.metadata;
