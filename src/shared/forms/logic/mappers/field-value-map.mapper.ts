import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";

/**
 * Filters submitted field values down to the fields allowlisted for echo.
 *
 * Echoed values become client-visible `metadata.formData` on failed submits,
 * so anything sensitive (passwords above all) must stay off the allowlist.
 *
 * @typeParam T - Allowed field name union.
 * @param values - Submitted values (raw or validated), possibly sensitive.
 * @param allowedFields - Fields safe to echo back to the client.
 * @returns A frozen {@link SparseFieldValueMap} containing only allowlisted fields with defined values.
 */
export function selectEchoedFieldValues<T extends string>(
	values: SparseFieldValueMap<T, string>,
	allowedFields: readonly T[],
): SparseFieldValueMap<T, string> {
	const result = {} as Record<T, string>;

	for (const field of allowedFields) {
		const value = values[field];

		if (value !== undefined) {
			result[field] = value;
		}
	}

	return Object.freeze(result);
}
