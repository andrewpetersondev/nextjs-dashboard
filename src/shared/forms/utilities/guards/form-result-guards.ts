import type { AppError } from "@/shared/errors/core/app-error.class";
import type {
  FormResult,
  FormSuccessPayload,
} from "@/shared/forms/types/form-result.types";
import type { Result } from "@/shared/result/result.types";

/**
 * Type guard: checks if the form result is successful.
 *
 * @typeParam T - The type of the success payload.
 * @param r - The form result to check.
 * @returns True if the result is successful.
 */
export const isFormOk = <T>(
  r: FormResult<T>,
): r is Result<FormSuccessPayload<T>, never> => r.ok;

/**
 * Type guard: checks if the form result is an error.
 *
 * @typeParam T - The type of the success payload.
 * @param r - The form result to check.
 * @returns True if the result is an error.
 */
export const isFormErr = <T>(r: FormResult<T>): r is Result<never, AppError> =>
  !r.ok;

/**
 * Type guard: checks if an AppError contains form validation details.
 *
 * @param error - The error to check.
 * @returns True if the error is a validation error with field errors.
 */
export const isFormValidationError = (error: AppError): boolean =>
  error.code === "validation" &&
  error.metadata !== undefined &&
  "fieldErrors" in error.metadata;
