import { extractFormDataFields } from "@/shared/forms/fields/formdata.extractor";

/**
 * Resolve the raw payload:
 * - If an explicit raw map is provided and non-empty, project it.
 * - Otherwise, build from FormData.
 */
export function resolveRawFieldPayload<TFieldNames extends string>(
  formData: FormData,
  fields: readonly TFieldNames[],
  explicitRaw?: Readonly<Partial<Record<TFieldNames, unknown>>>,
): Readonly<Partial<Record<TFieldNames, string>>> {
  if (explicitRaw && Object.keys(explicitRaw).length > 0) {
    const out: Partial<Record<TFieldNames, string>> = {};

    for (const f of fields) {
      const v = explicitRaw[f];

      if (v !== undefined) {
        out[f] = String(v);
      }
    }
    return Object.freeze(out);
  }
  return extractFormDataFields<TFieldNames>(formData, fields);
}
