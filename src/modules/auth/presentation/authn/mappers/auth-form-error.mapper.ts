import "server-only";
import { LOGIN_FIELDS_LIST } from "@/modules/auth/application/auth-user/schemas/login-request.schema";
import { SIGNUP_FIELDS_LIST } from "@/modules/auth/application/auth-user/schemas/signup-request.schema";
import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { toFormErrorPayload } from "@/shared/forms/adapters/form-error.adapter";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";

const LOGIN_CREDENTIALS_ERROR_MESSAGE =
  "Invalid credentials. Please try again.";

type LoginFormData = Readonly<Partial<Record<LoginField, string>>>;
type SignupFormData = Readonly<Partial<Record<SignupField, string>>>;

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
function mapGenericAuthError<TField extends string>(
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

/**
 * Converts signup authentication errors into UI-compatible {@link FormResult} objects.
 *
 * @remarks
 * Maps all signup errors consistently. Unlike login, signup doesn't require
 * the same unified error message strategy for security against enumeration,
 * as the existence of an account is typically revealed during the process.
 *
 * Returns `FormResult<never>` because this mapper is intended for error scenarios
 * only (it never returns a success state).
 *
 * @param error - The application error encountered during signup.
 * @param formData - The data submitted with the signup form.
 * @returns A {@link FormResult} containing the mapped errors.
 */
export function toSignupFormResult(
  error: AppError,
  formData: SignupFormData,
): FormResult<never> {
  return mapGenericAuthError(error, formData, SIGNUP_FIELDS_LIST);
}
