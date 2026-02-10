import "server-only";
import { mapGenericAuthError } from "@/modules/auth/presentation/authn/mappers/map-generic-auth.error";
import { SIGNUP_FIELDS_LIST } from "@/modules/auth/presentation/authn/transports/signup.form.schema";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { isPgMetadata } from "@/shared/errors/core/error-metadata.value";
import { getPgConstraintFromAppError } from "@/shared/errors/core/get-pg-constraint-from-app-error";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { PG_CODES } from "@/shared/errors/server/adapters/postgres/pg-codes";
import type {
  FieldError,
  SparseFieldErrorMap,
} from "@/shared/forms/core/types/field-error.types";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { toDenseFieldErrorMap } from "@/shared/forms/logic/mappers/field-error-map.mapper";
import { Err } from "@/shared/results/result";

type SignupFormData = Readonly<Partial<Record<SignupField, string>>>;

const ALREADY_IN_USE_FIELD_ERRORS: FieldError<string> = Object.freeze([
  "alreadyInUse",
] as const);

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
  if (
    isPgMetadata(error.metadata) &&
    error.metadata.pgCode === PG_CODES.UNIQUE_VIOLATION
  ) {
    const constraint = getPgConstraintFromAppError(error) ?? "";
    const sparseFieldErrorsMutable: Partial<
      Record<SignupField, FieldError<string>>
    > = {};

    const emailConflict = constraint.includes("email");
    const usernameConflict = constraint.includes("username");

    if (emailConflict) {
      sparseFieldErrorsMutable.email = ALREADY_IN_USE_FIELD_ERRORS;
    }

    if (usernameConflict) {
      sparseFieldErrorsMutable.username = ALREADY_IN_USE_FIELD_ERRORS;
    }

    if (!(emailConflict || usernameConflict)) {
      sparseFieldErrorsMutable.email = ALREADY_IN_USE_FIELD_ERRORS;
      sparseFieldErrorsMutable.username = ALREADY_IN_USE_FIELD_ERRORS;
    }

    const sparseFieldErrors = Object.freeze(
      sparseFieldErrorsMutable,
    ) as SparseFieldErrorMap<SignupField, string>;

    const fieldErrors = toDenseFieldErrorMap<SignupField, string>(
      sparseFieldErrors,
      SIGNUP_FIELDS_LIST,
    );

    return Err(
      makeAppError(APP_ERROR_KEYS.conflict, {
        cause: error,
        message: "Value already in use",
        metadata: Object.freeze({
          ...error.metadata,
          constraint,
          fieldErrors,
          formData,
          formErrors: Object.freeze([]),
          pgCode: PG_CODES.UNIQUE_VIOLATION,
        }),
      }),
    );
  }

  return mapGenericAuthError(error, formData, SIGNUP_FIELDS_LIST);
}
