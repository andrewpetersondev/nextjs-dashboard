import type { AppError } from "@/shared/errors/app-error/app-error";
import { getFieldErrors } from "@/shared/forms/application/field-errors.extractor";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/error-maps.types";

/**
 * Maps an AppError into a form-friendly payload:
 * - message: prefers details.formErrors[0], then error.message, then fallbackMessage
 * - fieldErrors: dense field error map (may be empty)
 *
 * Intended for use in server actions when converting AppError → FormResult.
 */
export function mapAppErrorToFormPayload<T extends string>(
  error: AppError,
  fallbackMessage: string,
): {
  message: string;
  fieldErrors: DenseFieldErrorMap<T, string>;
} {
  const fieldErrors =
    getFieldErrors<T>(error) ?? ({} as DenseFieldErrorMap<T, string>);

  const messageFromDetails = error.details?.formErrors?.[0];
  const message = messageFromDetails || error.message || fallbackMessage;

  return { fieldErrors, message };
}
