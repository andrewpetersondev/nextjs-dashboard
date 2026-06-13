import type { AppErrorLike } from "@/shared/core/errors/core/app-error.dto";
import type { DenseFieldErrorMap } from "@/shared/forms/core/types/field-error.types";
import type { FormErrorPayload } from "@/shared/forms/core/types/form-result.dto";
import {
	extractFieldErrors,
	extractFieldValues,
	extractFormErrors,
} from "@/shared/forms/logic/inspectors/form-error.inspector";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/mappers/field-error-map.mapper";

/**
 * Adapts a canonical AppError (entity or serialized DTO) into a shape the
 * Form UI can consume.
 *
 * This is the single mapper for turning an error into a form payload — both at
 * the action boundary (mapping a service error into a `FormResult`) and when
 * decoding a serialized `FormResult.error` back for the UI/tests. It surfaces
 * exactly what the error carries: `formErrors` comes straight from the error's
 * form metadata and is `[]` when there is none. It deliberately does NOT
 * synthesize a form-level error from `error.message` — callers that want the
 * message surfaced at the form level (e.g. `mapGenericAuthError`) opt into that
 * fallback explicitly, so conflicts that map to field-level errors keep
 * `formErrors` empty rather than echoing the raw message twice.
 *
 * @param error - The AppError from the service/action.
 * @param fields - Optional list of field names to ensure a dense error map.
 * @returns An object containing the top-level message and a map of field errors.
 */
export function toFormErrorPayload<T extends string>(
	error: AppErrorLike,
	fields?: readonly T[],
): FormErrorPayload<T> {
	const fieldErrors = extractFieldErrors<T>(error);

	return {
		fieldErrors:
			fieldErrors ??
			(fields
				? makeEmptyDenseFieldErrorMap<T, string>(fields)
				: // Fallback for when fields are not provided and it's not a validation error.
					// This cast is only safe if the consumer doesn't expect all fields to be present.
					(Object.freeze({}) as DenseFieldErrorMap<T, string>)),
		formData: extractFieldValues<T>(error) ?? Object.freeze({}),
		formErrors: extractFormErrors(error),
		message: error.message,
	};
}
