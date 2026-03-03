import "server-only";
import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";

/**
 * Extracts specified fields and their values from a FormData object.
 *
 * @param fd - The FormData object to extract fields from.
 * @param allowed - An array of allowed field names to pick.
 * @returns A readonly object containing the picked fields and their string values.
 */
function extractFormDataFields<T extends string>(
  fd: FormData,
  allowed: readonly T[],
): SparseFieldValueMap<T, string> {
  const out = {} as Record<T, string>;

  for (const k of allowed) {
    const v = fd.get(k);
    if (v !== null) {
      out[k] = typeof v === "string" ? v : String(v);
    }
  }

  return Object.freeze(out);
}

/**
 * Build the raw payload used for form validation.
 *
 * Uses the provided `explicitRaw` map when it exists and contains keys;
 * otherwise extracts the requested fields from the given `FormData`.
 *
 * @typeParam T - string union of valid field names.
 * @param formData - The `FormData` to extract values from when `explicitRaw` is absent or empty.
 * @param fields - The list of field names to include in the result.
 * @param explicitRaw - Optional explicit mapping of raw values. When non-empty this takes precedence.
 * @returns A readonly partial mapping of field names to their stringified raw values.
 */
export function resolveRawFieldPayload<T extends string>(
  formData: FormData,
  fields: readonly T[],
  explicitRaw?: SparseFieldValueMap<T, unknown>,
): SparseFieldValueMap<T, string> {
  if (explicitRaw && Object.keys(explicitRaw).length > 0) {
    const out = {} as Record<T, string>;

    for (const f of fields) {
      const value = explicitRaw[f];
      if (value !== undefined && value !== null) {
        out[f] = String(value);
      }
    }

    return Object.freeze(out);
  }

  return extractFormDataFields<T>(formData, fields);
}
