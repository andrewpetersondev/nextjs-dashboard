import type { SparseFieldValueMap } from "@/shared/forms/domain/types/error-maps.types";

/**
 * Build a sparse map of user-displayable string values from a raw payload.
 *
 * @typeParam T - Union of field name string literals.
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
