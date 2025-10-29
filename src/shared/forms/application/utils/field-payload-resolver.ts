import { extractFormDataFields } from "@/shared/forms/infrastructure/formdata/extractor";

/**
 * Resolve the raw payload for form validation.
 * - If an explicit raw map is provided and non-empty, project it.
 * - Otherwise, build from FormData.
 *
 * @remarks
 * This is application-level coordination between explicit data and FormData extraction.
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
