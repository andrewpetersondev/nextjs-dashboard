import type { AppError } from "@/shared/errors/core/app-error";
import { extractFieldErrors } from "@/shared/forms/infrastructure/form-error-inspector";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-error.value";
import type { FormErrorPayload } from "@/shared/forms/types/form-result.dto";

/**
 * Adapts an AppError to a form payload with field errors and a message.
 *
 * An adapter translates an interface (AppError) into another (form payload) for compatibility.
 * A mapper typically transforms data between similar shapes or domains.
 *
 * @template T - Field name type.
 * @param error - The AppError instance.
 * @returns Object with alphabetically sorted properties: fieldErrors, message.
 */
export function adaptAppErrorToFormPayload<T extends string>(
  error: AppError,
): FormErrorPayload<T> {
  const fieldErrors =
    extractFieldErrors<T>(error) ?? ({} as DenseFieldErrorMap<T, string>);

  return {
    fieldErrors,
    message: error.message,
  };
}
