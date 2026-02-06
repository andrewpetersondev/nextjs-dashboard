import "server-only";
import { SIGNUP_FIELDS_LIST } from "@/modules/auth/application/auth-user/schemas/signup-request.schema";
import { mapGenericAuthError } from "@/modules/auth/application/shared/mappers/flows/login/map-generic-auth.error";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { AppError } from "@/shared/errors/core/app-error.entity";
import { isPgMetadata } from "@/shared/errors/core/error-metadata.value";
import { PG_CODES } from "@/shared/errors/server/adapters/postgres/pg-codes";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { toDenseFieldErrorMap } from "@/shared/forms/logic/factories/field-error-map.factory";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";

type SignupFormData = Readonly<Partial<Record<SignupField, string>>>;

function getPgConstraintFromError(error: AppError): string | undefined {
  if (isPgMetadata(error.metadata) && error.metadata.constraint) {
    return error.metadata.constraint;
  }

  const cause = error.cause;
  if (cause instanceof AppError) {
    return getPgConstraintFromError(cause);
  }

  return;
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
  // Server Action contract: signup conflicts must return field-level errors.
  // We detect Postgres unique violations and translate them into a validation-style
  // form error so the UI can render `fieldErrors` deterministically.
  if (
    isPgMetadata(error.metadata) &&
    error.metadata.pgCode === PG_CODES.UNIQUE_VIOLATION
  ) {
    const constraint = getPgConstraintFromError(error) ?? "";
    const sparseFieldErrors: Partial<Record<SignupField, readonly string[]>> =
      {};

    const emailConflict = constraint.includes("email");
    const usernameConflict = constraint.includes("username");

    if (emailConflict) {
      sparseFieldErrors.email = Object.freeze(["alreadyInUse"]);
    }

    if (usernameConflict) {
      sparseFieldErrors.username = Object.freeze(["alreadyInUse"]);
    }

    // Fallback: if we can't determine the field, mark both likely candidates.
    if (!(emailConflict || usernameConflict)) {
      sparseFieldErrors.email = Object.freeze(["alreadyInUse"]);
      sparseFieldErrors.username = Object.freeze(["alreadyInUse"]);
    }

    const fieldErrors = toDenseFieldErrorMap<SignupField, string>(
      sparseFieldErrors,
      SIGNUP_FIELDS_LIST,
    );

    return makeFormError<SignupField>({
      fieldErrors,
      formData,
      formErrors: Object.freeze([]),
      key: APP_ERROR_KEYS.validation,
      message: "Value already in use",
    });
  }

  return mapGenericAuthError(error, formData, SIGNUP_FIELDS_LIST);
}
