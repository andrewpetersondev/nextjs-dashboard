import "server-only";
import { SIGNUP_FIELDS_LIST } from "@/modules/auth/application/auth-user/schemas/signup-request.schema";
import { mapGenericAuthError } from "@/modules/auth/application/shared/mappers/flows/login/map-generic-auth.error";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";

type SignupFormData = Readonly<Partial<Record<SignupField, string>>>;

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
