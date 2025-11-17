import { extractFormDataFields } from "@/shared/forms/infrastructure/extractor.formdata";

/**
 * Build the raw payload used for form validation.
 *
 * Uses the provided `explicitRaw` map when it exists and contains keys;
 * otherwise extracts the requested fields from the given `FormData`.
 *
 * @typeParam Tfieldnames - string union of valid field names.
 * @param formData - The `FormData` to extract values from when `explicitRaw` is absent or empty.
 * @param fields - The list of field names to include in the result.
 * @param explicitRaw - Optional explicit mapping of raw values. When non-empty this takes precedence.
 * @returns A readonly partial mapping of field names to their stringified raw values.
 */
export function resolveRawFieldPayload<Tfieldnames extends string>(
  formData: FormData,
  fields: readonly Tfieldnames[],
  explicitRaw?: Readonly<Partial<Record<Tfieldnames, unknown>>>,
): Readonly<Partial<Record<Tfieldnames, string>>> {
  if (explicitRaw && Object.keys(explicitRaw).length > 0) {
    const out: Partial<Record<Tfieldnames, string>> = {};

    for (const f of fields) {
      const v = explicitRaw[f];

      if (v !== undefined) {
        out[f] = String(v);
      }
    }
    return Object.freeze(out);
  }
  return extractFormDataFields<Tfieldnames>(formData, fields);
}
