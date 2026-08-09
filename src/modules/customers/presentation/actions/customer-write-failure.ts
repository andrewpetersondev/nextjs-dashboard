import "server-only";
import type { CustomerWriteFieldNames } from "@/modules/customers/domain/customer.schema";
import { CUSTOMER_ERROR_MESSAGES } from "@/modules/customers/domain/messages";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import type { FormResult } from "@/shared/forms/core/form-result.dto";
import {
	makeEmptyDenseFieldErrorMap,
	toDenseFieldErrorMap,
} from "@/shared/forms/logic/field-error-map.mapper";
import { makeFormError } from "@/shared/forms/logic/form-result.factory";

const EMPTY_FORM_DATA = {} as Readonly<
	Partial<Record<CustomerWriteFieldNames, string>>
>;

/**
 * Builds a form failure with no field attribution.
 */
export function customerFormFailure(
	fields: readonly CustomerWriteFieldNames[],
	key: keyof typeof APP_ERROR_KEYS,
	message: string,
): FormResult<never> {
	return makeFormError<CustomerWriteFieldNames>({
		fieldErrors: makeEmptyDenseFieldErrorMap(fields),
		formData: EMPTY_FORM_DATA,
		formErrors: [],
		key: APP_ERROR_KEYS[key],
		message,
	});
}

/**
 * Translates a failed customer write into a form failure, attributing a
 * duplicate email to the field that caused it.
 *
 * @remarks
 * `conflict` is the key `normalizePgError` assigns to Postgres `23505`, and
 * `customers.email` carries the table's only unique constraint — so a conflict
 * on a customer write is always a duplicate email, and belongs on that field
 * rather than as a generic form-level error. Shared by create and update
 * because both can hit the same constraint.
 */
export function customerWriteFailure(
	fields: readonly CustomerWriteFieldNames[],
	error: AppError,
	fallbackMessage: string,
): FormResult<never> {
	if (error.key !== APP_ERROR_KEYS.conflict) {
		return customerFormFailure(fields, "validation", fallbackMessage);
	}

	return makeFormError<CustomerWriteFieldNames>({
		fieldErrors: toDenseFieldErrorMap<CustomerWriteFieldNames, string>(
			{ email: [CUSTOMER_ERROR_MESSAGES.duplicateEmail] },
			fields,
		),
		formData: EMPTY_FORM_DATA,
		formErrors: [],
		key: APP_ERROR_KEYS.conflict,
		message: CUSTOMER_ERROR_MESSAGES.duplicateEmail,
	});
}
