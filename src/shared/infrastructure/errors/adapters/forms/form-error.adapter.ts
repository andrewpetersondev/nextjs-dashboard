import type { DenseFieldErrorMap } from "@/shared/application/forms/domain/types/error-maps.types";
import type { FormErrorPayload } from "@/shared/application/forms/domain/types/form-result.types";
import type { AppError } from "@/shared/infrastructure/errors/core/app-error.class";
import { getFieldErrors } from "@/shared/infrastructure/errors/guards/form-error.guards";

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
