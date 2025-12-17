import type { AppError } from "@/shared/errors/core/app-error";
import { getFieldErrors } from "@/shared/errors/guards/form-metadata";
import type { DenseFieldErrorMap } from "@/shared/forms/types/form.types";
import type { FormErrorPayload } from "@/shared/forms/types/form-result.types";

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
  const sparse = getFieldErrors(error) ?? {};
  const fieldErrors: DenseFieldErrorMap<T, string> =
    sparse as DenseFieldErrorMap<T, string>;

  return {
    fieldErrors,
    message: error.message,
  };
}
