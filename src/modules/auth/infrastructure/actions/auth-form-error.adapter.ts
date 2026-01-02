import "server-only";

import type {
  LoginField,
  SignupField,
} from "@/modules/auth/application/dtos/auth-ui.dto";
import {
  LOGIN_FIELDS_LIST,
  SIGNUP_FIELDS_LIST,
} from "@/modules/auth/domain/schemas/auth-user.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { toFormErrorPayload } from "@/shared/forms/adapters/form-error.adapter";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";

const LOGIN_CREDENTIALS_ERROR_MESSAGE =
  "Invalid credentials. Please try again.";

type LoginFormData = Readonly<Partial<Record<LoginField, string>>>;
type SignupFormData = Readonly<Partial<Record<SignupField, string>>>;

/**
 * Maps invalid_credentials errors to field-level errors for email and password.
 *
 * Provides a unified security response that doesn't reveal which field
 * was incorrect, preventing username enumeration attacks.
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
 * Maps generic auth errors to FormResult with appropriate field and form-level errors.
 *
 * Ensures that if no specific field errors exist, the general error message
 * is surfaced at the form level for user feedback.
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
 * Converts login authentication errors into UI-compatible FormResults.
 *
 * Handles invalid_credentials with unified security responses for email/password fields.
 *
 * @remarks
 * Returns `FormResult<never>` because this function only returns errors (never success).
 * The type casting is safe since error results are covariant in their success type parameter.
 */
export function mapLoginErrorToFormResult(
  error: AppError,
  formData: LoginFormData,
): FormResult<never> {
  if (error.key === "invalid_credentials") {
    return mapLoginInvalidCredentialsError(error, formData);
  }

  return mapGenericAuthError(error, formData, LOGIN_FIELDS_LIST);
}

/**
 * Converts signup authentication errors into UI-compatible FormResults.
 *
 * Maps all errors consistently without special credential handling
 * (signup doesn't have the same enumeration attack surface as login).
 *
 * @remarks
 * Returns `FormResult<never>` because this function only returns errors (never success).
 */
export function mapSignupErrorToFormResult(
  error: AppError,
  formData: SignupFormData,
): FormResult<never> {
  return mapGenericAuthError(error, formData, SIGNUP_FIELDS_LIST);
}
