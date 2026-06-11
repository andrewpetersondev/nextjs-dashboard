import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";

/**
 * Input options for form validation.
 *
 * @typeParam T - The shape of the object being validated.
 * @typeParam K - A string literal union of keys from `T` representing field names.
 */
export interface FormValidationOptions<T, K extends keyof T & string> {
	/**
	 * Fields safe to echo back to the client in error metadata (`formData`)
	 * for repopulation after a failed submit. Anything not listed — passwords
	 * in particular — never leaves the server. Defaults to echoing nothing.
	 */
	readonly echoFields?: readonly K[];
	readonly fields?: readonly K[];
	readonly loggerContext?: string;
	readonly messages?: {
		readonly failureMessage?: string;
		readonly successMessage?: string;
	};
	readonly raw?: SparseFieldValueMap<K, unknown>;
}
