import type { SparseFieldValueMap } from "@/shared/forms/types/sparse.types";

/**
 * Build a sparse map of user-displayable string values from a raw payload.
 *
 * @typeParam TFieldNames - Union of field name string literals.
 */
export function selectDisplayableStringFieldValues<TFieldNames extends string>(
  raw: Readonly<Record<string, unknown>>,
  fields: readonly TFieldNames[],
  redactFields: readonly TFieldNames[],
): SparseFieldValueMap<TFieldNames> {
  const values: Partial<Record<TFieldNames, string>> = {};

  for (const key of fields) {
    if (redactFields.includes(key)) {
      continue;
    }
    const v = raw[key as string];
    if (typeof v === "string") {
      values[key] = v;
    }
  }

  return values;
}
