import type { SparseFieldValueMap } from "@/shared/forms/types/sparse.types";

/**
 * Build a sparse map of user-displayable string values from a raw payload.
 *
 * @typeParam TField - Union of field name string literals.
 */
export function selectDisplayableStringFieldValues<TField extends string>(
  raw: Readonly<Record<string, unknown>>,
  fields: readonly TField[],
  redactFields: readonly TField[],
): SparseFieldValueMap<TField> {
  const values: Partial<Record<TField, string>> = {};

  for (const key of fields) {
    if (redactFields.includes(key)) {
      continue;
    }
    const v = raw[key as string];
    if (typeof v === "string") {
      values[key] = v;
    }
  }

  return Object.freeze(values) as SparseFieldValueMap<TField>;
}
