import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";

/**
 * Type guard: checks if the form result is successful.
 */
export const isFormOk = <T>(
  r: FormResult<T>,
): r is Extract<FormResult<T>, { ok: true }> => r.ok;

/**
 * Type guard: checks if the form result is an error.
 */
export const isFormErr = <T>(
  r: FormResult<T>,
): r is Extract<FormResult<T>, { ok: false }> => !r.ok;

/**
 * Type guard: checks if an AppError contains form validation details.
 *
 * @param error - The error to check.
 * @returns True if the error is a validation error with field errors.
 */
export const isFormValidationError = (error: AppError): boolean =>
  error.key === APP_ERROR_KEYS.validation &&
  error.metadata !== undefined &&
  "fieldErrors" in error.metadata;
