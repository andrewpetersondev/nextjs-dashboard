import type { SparseFieldValueMap } from "@/shared/forms/types/field-errors.type";

/**
 * Builds a partial record of user-displayable string values from a raw payload.
 *
 * @typeParam TFieldNames - Union of field name string literals.
 *
 * @param raw - Arbitrary raw payload keyed by field name.
 * @param fields - Ordered list of field names to consider for extraction.
 * @param redactFields - Field names that must not be included in the result (e.g., passwords).
 *
 * @returns A partial record mapping field names to their string values.
 *
 * @remarks
 * - Only values of type `string` are included.
 * - Fields listed in {@link redactFields} are skipped.
 * - Non-string values (e.g., File, number) are ignored to prevent unsafe coercion.
 */
export function buildDisplayFieldValues<TFieldNames extends string>(
  raw: Record<string, unknown>,
  fields: readonly TFieldNames[],
  redactFields: readonly TFieldNames[],
): SparseFieldValueMap<TFieldNames> {
  // Result is partial because not every field will have a string value present.
  const values: Partial<Record<TFieldNames, string>> = {};

  // Iterate only over allowed fields to avoid leaking unexpected keys.
  for (const key of fields) {
    // Skip sensitive fields (e.g., password) from being echoed back.
    if (redactFields.includes(key)) {
      continue;
    }

    // Read raw value for the current key.
    const v = raw[key as string];

    // Only expose string values; ignore files/numbers/booleans/etc.
    if (typeof v === "string") {
      values[key] = v;
    }
  }

  return values;
}
