import type { SparseFieldValueMap } from "@/shared/application/forms/domain/types/error-maps.types";

/**
 * Extracts a sparse map of user-displayable string values from a raw object.
 *
 * @typeParam T - Union of string field names to extract.
 * @param raw - The source object containing field values.
 * @param fields - The list of field names to include.
 * @param redactFields - The list of field names to omit from the result.
 * @returns An immutable map of field names to string values.
 *
 * @example
 * const raw = { name: "Alice", email: "alice@example.com", age: 30 };
 * const fields = ["name", "email"] as const;
 * const redactFields = ["email"] as const;
 * const result = selectDisplayableStringFieldValues(raw, fields, redactFields);
 * // result: { name: "Alice" }
 */
export function selectDisplayableStringFieldValues<T extends string>(
  raw: Readonly<Record<string, unknown>>,
  fields: readonly T[],
  redactFields: readonly T[],
): SparseFieldValueMap<T, string> {
  const values: Partial<Record<T, string>> = {};

  for (const key of fields) {
    const shouldRedact = redactFields.includes(key);

    const v = raw[key as string];

    if (!shouldRedact && typeof v === "string") {
      values[key] = v;
    }
  }

  return Object.freeze(values) as SparseFieldValueMap<T, string>;
}
