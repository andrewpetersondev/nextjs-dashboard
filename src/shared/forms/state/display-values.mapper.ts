import type { SparseFieldValueMap } from "@/shared/forms/domain/error-maps.types";

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
    const shouldRedact = redactFields.includes(key);
    const v = raw[key as string];

    if (!shouldRedact && typeof v === "string") {
      values[key] = v;
    }
  }

  return Object.freeze(values) as SparseFieldValueMap<Tfield, string>;
}
