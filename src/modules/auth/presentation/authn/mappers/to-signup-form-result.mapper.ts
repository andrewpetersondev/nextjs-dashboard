import "server-only";
import { mapGenericAuthError } from "@/modules/auth/presentation/authn/mappers/map-generic-auth.error";
import {
	SIGNUP_ECHO_FIELDS_LIST,
	SIGNUP_FIELDS_LIST,
} from "@/modules/auth/presentation/authn/transports/signup.form.schema";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { isPgMetadata } from "@/shared/core/errors/core/metadata/error-metadata.value";

import { PG_CODES } from "@/shared/core/errors/server/adapters/postgres/pg-error.constants";
import { getPgConstraintFromAppError } from "@/shared/core/errors/server/adapters/postgres/pg-error.utils";
import type {
	FieldError,
	SparseFieldErrorMap,
} from "@/shared/forms/core/types/field-error.types";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { toFormErrResult } from "@/shared/forms/logic/factories/form-result.factory";
import { toDenseFieldErrorMap } from "@/shared/forms/logic/mappers/field-error-map.mapper";
import { selectEchoedFieldValues } from "@/shared/forms/logic/mappers/field-value-map.mapper";

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
 * The unique-violation branch builds the client-visible metadata explicitly
 * (field errors, echoed form data, pg code) instead of forwarding the server
 * error's metadata, so raw Postgres fields never reach the client. The full
 * server error is preserved as `cause` for server-side logging.
 *
 * Returns `FormResult<never>` because this mapper is intended for error scenarios
 * only (it never returns a success state).
 *
 * Only fields in `SIGNUP_ECHO_FIELDS_LIST` are echoed back in error metadata;
 * the submitted password never leaves the server.
 *
 * @param error - The application error encountered during signup.
 * @param formData - The data submitted with the signup form.
 * @returns A {@link FormResult} containing the mapped errors.
 */
export function toSignupFormResult(
	error: AppError,
	formData: SignupFormData,
): FormResult<never> {
	const echoed = selectEchoedFieldValues<SignupField>(
		formData,
		SIGNUP_ECHO_FIELDS_LIST,
	);

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

		// The result crosses the Server Action boundary (toDto keeps metadata
		// verbatim but drops cause), so metadata carries only form-relevant
		// fields. Postgres internals — detail, table, schema, constraint —
		// stay server-side on the cause chain. pgCode is kept because
		// ConflictErrorMetadataSchema requires it.
		return toFormErrResult(
			makeAppError(APP_ERROR_KEYS.conflict, {
				cause: error,
				message: "Value already in use",
				metadata: Object.freeze({
					fieldErrors,
					formData: echoed,
					formErrors: Object.freeze([]),
					pgCode: PG_CODES.UNIQUE_VIOLATION,
				}),
			}),
		);
	}

	return mapGenericAuthError(error, echoed, SIGNUP_FIELDS_LIST);
}
