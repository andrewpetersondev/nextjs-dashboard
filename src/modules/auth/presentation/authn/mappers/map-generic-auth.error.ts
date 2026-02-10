import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";
import { toFormErrorPayload } from "@/shared/forms/presentation/mappers/form-error-payload.mapper";

/**
 * Maps generic authentication errors to a {@link FormResult} with appropriate field and form-level errors.
 *
 * @remarks
 * This helper ensures that if no specific field errors are found in the {@link AppError},
 * the general error message is surfaced at the form level to provide feedback to the user.
 *
 * @template TField - The type of form fields.
 * @param error - The application error to map.
 * @param formData - The data submitted with the form.
 * @param fields - The list of valid field names for the form.
 * @returns A {@link FormResult} containing the mapped errors.
 * @internal
 */
export function mapGenericAuthError<TField extends string>(
  error: AppError,
  formData: Readonly<Partial<Record<TField, string>>>,
  fields: readonly TField[],
): FormResult<never> {
  const payload = toFormErrorPayload<TField>(error, fields);

  return makeFormError<TField>({
    ...payload,
    formData,
    formErrors:
      payload.formErrors.length > 0 ? payload.formErrors : [payload.message],
    key: error.key,
  }) as FormResult<never>;
}
