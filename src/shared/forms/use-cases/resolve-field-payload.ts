import { extractFormDataFields } from "@/shared/forms/infrastructure/extract-form-fields";

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
  explicitRaw?: Readonly<Partial<Record<T, unknown>>>,
): Readonly<Partial<Record<T, string>>> {
  if (explicitRaw && Object.keys(explicitRaw).length > 0) {
    const out: Partial<Record<T, string>> = {};

    for (const f of fields) {
      const v = explicitRaw[f];

      if (v !== undefined) {
        out[f] = String(v);
      }
    }
    return Object.freeze(out);
  }
  return extractFormDataFields<T>(formData, fields);
}
