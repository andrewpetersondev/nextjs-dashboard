import type { AppErrorLike } from "@/shared/core/errors/core/app-error.dto";
import { isFormValidationError } from "@/shared/forms/core/guards/form-result.guard";
import type {
	DenseFieldErrorMap,
	FormErrors,
} from "@/shared/forms/core/types/field-error.types";
import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";

/**
 * Extracts dense field errors from an AppError or its serialized DTO.
 * Returns undefined if the error carries no form validation metadata.
 *
 * Key-agnostic: detection is by the SHAPE of `metadata` (see
 * `isFormValidationError`), so a `conflict`-keyed duplicate-signup error and
 * any other metadata-carrying key round-trip their field errors identically.
 *
 * @example
 * const errors = extractFieldErrors<'email' | 'password'>(appError);
 * if (errors) {
 *   console.log(errors.email); // readonly string[]
 * }
 */
export const extractFieldErrors = <T extends string>(
	error: AppErrorLike,
): DenseFieldErrorMap<T, string> | undefined => {
	if (isFormValidationError<T>(error)) {
		return error.metadata.fieldErrors;
	}

	return;
};

/**
 * Extracts echoed field values from an AppError or its serialized DTO.
 * Returns undefined if not present.
 */
export const extractFieldValues = <T extends string>(
	error: AppErrorLike,
): SparseFieldValueMap<T, string> | undefined => {
	if (isFormValidationError<T>(error)) {
		return error.metadata.formData;
	}

	return;
};

/**
 * Extracts form-level errors from an AppError or its serialized DTO.
 * Returns a frozen empty array if not present.
 */
export const extractFormErrors = (error: AppErrorLike): FormErrors => {
	if (isFormValidationError(error)) {
		return error.metadata.formErrors;
	}

	return Object.freeze([]);
};
