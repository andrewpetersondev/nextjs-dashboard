import type { SparseFieldValueMap } from "@/shared/forms/domain/models/error-maps";

/**
 * Build a sparse map of user-displayable string values from a raw payload.
 *
 * @typeParam Tfield - Union of field name string literals.
 */
export function selectDisplayableStringFieldValues<Tfield extends string>(
  raw: Readonly<Record<string, unknown>>,
  fields: readonly Tfield[],
  redactFields: readonly Tfield[],
): SparseFieldValueMap<Tfield, string> {
  const values: Partial<Record<Tfield, string>> = {};

  for (const key of fields) {
    if (redactFields.includes(key)) {
      continue;
    }
    const v = raw[key as string];
    if (typeof v === "string") {
      values[key] = v;
    }
  }

  return Object.freeze(values) as SparseFieldValueMap<Tfield, string>;
}
