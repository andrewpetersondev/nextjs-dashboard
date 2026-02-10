import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { DenseFieldErrorMap } from "@/shared/forms/core/types/field-error.types";
import type { FormErrorPayload } from "@/shared/forms/core/types/form-result.dto";
import {
  extractFieldErrors,
  extractFieldValues,
  extractFormErrors,
} from "@/shared/forms/logic/inspectors/form-error.inspector";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/mappers/field-error-map.mapper";

// TODO: THESE FUNCTIONS OVERLAP AND INDICATE A REFACTOR IS NEEDED

/**
 * Adapts a canonical AppError into a shape the Form UI can consume.
 *
 * @param error - The AppError from the service/action.
 * @param fields - Optional list of field names to ensure a dense error map.
 * @returns An object containing the top-level message and a map of field errors.
 */
export function toFormErrorPayload<T extends string>(
  error: AppError,
  fields?: readonly T[],
): FormErrorPayload<T> {
  const fieldErrors = extractFieldErrors<T>(error);

  return {
    fieldErrors:
      fieldErrors ??
      (fields
        ? makeEmptyDenseFieldErrorMap<T, string>(fields)
        : // Fallback for when fields are not provided and it's not a validation error.
          // This cast is only safe if the consumer doesn't expect all fields to be present.
          (Object.freeze({}) as DenseFieldErrorMap<T, string>)),
    formData: extractFieldValues<T>(error) ?? Object.freeze({}),
    formErrors: extractFormErrors(error),
    message: error.message,
  };
}

/**
 * Helper to extract form-specific error payload from a generic Result.
 * Essential for UI components to display fieldErrors and formErrors.
 */
export function formErrorPayloadMapper<F extends string>(
  error: AppError,
): FormErrorPayload<F> {
  const formErrors = extractFormErrors(error);

  return {
    fieldErrors:
      extractFieldErrors<F>(error) ??
      (Object.freeze({}) as DenseFieldErrorMap<F, string>),
    formData: extractFieldValues<F>(error) ?? Object.freeze({}),
    formErrors: formErrors.length > 0 ? formErrors : [error.message],
    message: error.message,
  };
}
