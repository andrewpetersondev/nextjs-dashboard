import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { AppErrorKey } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Ok } from "@/shared/core/result/result";
import type {
	DenseFieldErrorMap,
	FormErrors,
} from "@/shared/forms/core/types/field-error.types";
import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";
import type {
	FormResult,
	FormSuccessPayload,
} from "@/shared/forms/core/types/form-result.dto";
import type { FormValidationMetadata } from "@/shared/forms/core/types/validation.types";

/**
 * Parameters for creating a form error result.
 */
interface FormErrorParams<TFields extends string> {
	readonly fieldErrors: DenseFieldErrorMap<TFields, string>;
	readonly formData: SparseFieldValueMap<TFields, string>;
	readonly formErrors: FormErrors;
	readonly key: AppErrorKey;
	readonly message: string;
}

/**
 * Wraps an AppError as a failed form result, serializing it to a plain DTO.
 *
 * Form results cross the Server Action boundary (`useActionState`), so the
 * error must be a plain object — an `AppError` instance would break Next.js
 * serialization for progressive enhancement.
 *
 * @param error - The AppError to serialize into the result.
 * @returns A frozen failed FormResult carrying the error as a DTO.
 */
export const toFormErrResult = (error: AppError): FormResult<never> => {
	return Object.freeze({ error: error.toDto(), ok: false as const });
};

/**
 * Create a form validation error result.
 *
 * @param params - Error construction parameters including fields and form-level errors.
 * @returns A Result containing a serialized AppError with validation metadata.
 */
export const makeFormError = <TFields extends string>(
	params: FormErrorParams<TFields>,
): FormResult<never> => {
	const metadata: FormValidationMetadata<TFields> = Object.freeze({
		fieldErrors: params.fieldErrors,
		formData: params.formData,
		formErrors: params.formErrors,
	});

	return toFormErrResult(
		makeAppError(params.key, {
			cause: "",
			message: params.message,
			metadata,
		}),
	);
};

/**
 * Create a successful form result.
 *
 * @param data - The payload value to return to the caller.
 * @param message - Human-readable success message for UI feedback.
 * @returns A Result containing the success payload.
 */
export const makeFormOk = <TData>(
	data: TData,
	message: string,
): FormResult<TData> => {
	return Ok(
		Object.freeze({
			data,
			message,
		} satisfies FormSuccessPayload<TData>),
	);
};
