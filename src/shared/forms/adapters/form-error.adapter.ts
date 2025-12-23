import type { AppError } from "@/shared/errors/core/app-error.entity";
import { extractFieldErrors } from "@/shared/forms/infrastructure/form-error-inspector";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-error.value";
import type { FormErrorPayload } from "@/shared/forms/types/form-result.dto";

/**
 * Adapts a canonical AppError into a shape the Form UI can consume.
 *
 * @param error - The AppError from the service/action.
 * @returns An object containing the top-level message and a map of field errors.
 */
export function toFormErrorPayload<T extends string>(
  error: AppError,
): FormErrorPayload<T> {
  const fieldErrors =
    extractFieldErrors<T>(error) ?? ({} as DenseFieldErrorMap<T, string>);

  return {
    fieldErrors,
    message: error.message,
  };
}
