import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { DenseFieldErrorMap } from "@/shared/forms/core/types/field-error.value";
import type { FormErrorPayload } from "@/shared/forms/core/types/form-result.dto";
import { extractFieldErrors } from "@/shared/forms/logic/inspectors/form-error.inspector";

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

  const formErrors =
    (error.metadata?.formErrors as readonly string[] | undefined) ?? [];

  return {
    fieldErrors,
    formErrors,
    message: error.message,
  };
}
