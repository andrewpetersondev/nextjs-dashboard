import type { AppErrorLike } from "@/shared/core/errors/core/app-error.dto";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { isFormValidationError } from "@/shared/forms/core/guards/form-result.guard";
import type {
	DenseFieldErrorMap,
	FormErrors,
} from "@/shared/forms/core/types/field-error.types";
import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";
import type { FormValidationMetadata } from "@/shared/forms/core/types/validation.types";

// Helper internal to the inspector. Accepts AppError entities and their
// serialized DTOs alike, since form results carry DTOs across the boundary.
function hasFormMetadata<T extends string>(
	error: AppErrorLike,
): error is AppErrorLike & { readonly metadata: FormValidationMetadata<T> } {
	return (
		error.key === APP_ERROR_KEYS.validation ||
		error.key === APP_ERROR_KEYS.conflict
	);
}

/**
 * Extracts dense field errors from an AppError or its serialized DTO.
 * Returns undefined if not a form validation error.
 *
 * @example
 * const errors = getFieldErrors<'email' | 'password'>(AppError);
 * if (errors) {
 *   console.log(errors.email); // readonly string[]
 * }
 */
export const extractFieldErrors = <T extends string>(
	error: AppErrorLike,
): DenseFieldErrorMap<T, string> | undefined => {
	if (hasFormMetadata<T>(error)) {
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
 * Returns empty array if not present.
 */
export const extractFormErrors = (error: AppErrorLike): FormErrors => {
	if (isFormValidationError(error)) {
		return error.metadata.formErrors;
	}

	return Object.freeze([]);
};
