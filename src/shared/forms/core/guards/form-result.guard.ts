import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import type { FormValidationMetadata } from "@/shared/forms/core/types/validation.types";

/**
 * Type guard: checks if the form result is an error.
 */
export const isFormErr = <TData>(
  result: FormResult<TData>,
): result is Extract<FormResult<TData>, { ok: false }> => {
  return !result.ok;
};

/**
 * Type guard: checks if the form result is successful.
 */
export const isFormOk = <TData>(
  result: FormResult<TData>,
): result is Extract<FormResult<TData>, { ok: true }> => {
  return result.ok;
};

/**
 * Type guard: checks if an AppError contains form validation details.
 */
export function isFormValidationError<TFields extends string>(
  error: AppError,
): error is AppError & { readonly metadata: FormValidationMetadata<TFields> } {
  return (
    error.key === APP_ERROR_KEYS.validation &&
    error.metadata !== undefined &&
    error.metadata !== null &&
    typeof error.metadata === "object" &&
    "fieldErrors" in error.metadata
  );
}
