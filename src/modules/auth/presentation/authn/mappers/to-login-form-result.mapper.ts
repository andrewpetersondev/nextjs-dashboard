import { mapGenericAuthError } from "@/modules/auth/presentation/authn/mappers/map-generic-auth.error";
import { LOGIN_FIELDS_LIST } from "@/modules/auth/presentation/authn/transports/login.form.schema";
import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { toFormErrorPayload } from "@/shared/forms/adapters/form-error.adapter";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";

const LOGIN_CREDENTIALS_ERROR_MESSAGE =
  "Invalid credentials. Please try again.";
type LoginFormData = Readonly<Partial<Record<LoginField, string>>>;

/**
 * Maps `invalid_credentials` errors to field-level errors for both email and password.
 *
 * @remarks
 * This function provides a unified security response that doesn't reveal whether
 * the email or the password was incorrect, thereby preventing username enumeration attacks.
 *
 * @param error - The application error to map.
 * @param formData - The data submitted with the login form.
 * @returns A {@link FormResult} containing the mapped errors.
 * @internal
 */
function mapLoginInvalidCredentialsError(
  error: AppError,
  formData: LoginFormData,
): FormResult<never> {
  const basePayload = toFormErrorPayload<LoginField>(error, LOGIN_FIELDS_LIST);

  return makeFormError<LoginField>({
    ...basePayload,
    fieldErrors: {
      email: [LOGIN_CREDENTIALS_ERROR_MESSAGE],
      password: [LOGIN_CREDENTIALS_ERROR_MESSAGE],
    },
    formData,
    formErrors: [LOGIN_CREDENTIALS_ERROR_MESSAGE],
    key: error.key,
    message: LOGIN_CREDENTIALS_ERROR_MESSAGE,
  }) as FormResult<never>;
}

/**
 * Converts login authentication errors into UI-compatible {@link FormResult} objects.
 *
 * @remarks
 * This function specifically handles `invalid_credentials` by providing a unified
 * security response for both email and password fields. Other errors are mapped
 * generically.
 *
 * Returns `FormResult<never>` because this mapper is intended for error scenarios
 * only (it never returns a success state).
 *
 * @param error - The application error encountered during login.
 * @param formData - The data submitted with the login form.
 * @returns A {@link FormResult} containing the mapped errors.
 */
export function toLoginFormResult(
  error: AppError,
  formData: LoginFormData,
): FormResult<never> {
  if (error.key === "invalid_credentials") {
    return mapLoginInvalidCredentialsError(error, formData);
  }

  return mapGenericAuthError(error, formData, LOGIN_FIELDS_LIST);
}
