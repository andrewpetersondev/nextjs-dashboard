import { extractRawRecordFromFormData } from "@/shared/forms/fields/formdata.extractor";

/**
 * Project an arbitrary raw map to the exact allowed field set.
 *
 * Ensures deterministic shape and ignores extraneous keys.
 */
export function projectRawRecordToAllowedFields<TFieldNames extends string>(
  raw: Readonly<Partial<Record<TFieldNames, unknown>>> | undefined,
  fields: readonly TFieldNames[],
): Record<TFieldNames, unknown> {
  if (!raw) {
    return {} as Record<TFieldNames, unknown>;
  }
  const out: Partial<Record<TFieldNames, unknown>> = {};
  for (const f of fields) {
    if (Object.hasOwn(raw, f)) {
      out[f] = raw[f];
    }
  }
  return out as Record<TFieldNames, unknown>;
}

/**
 * Resolve the raw payload:
 * - If an explicit raw map is provided and non-empty, project it.
 * - Otherwise, build from FormData.
 */
export function resolveRawFieldPayload<TFieldNames extends string>(
  formData: FormData,
  fields: readonly TFieldNames[],
  explicitRaw?: Readonly<Partial<Record<TFieldNames, unknown>>>,
): Readonly<Record<TFieldNames, string>> {
  if (explicitRaw && Object.keys(explicitRaw).length > 0) {
    const out: Partial<Record<TFieldNames, string>> = {};
    for (const f of fields) {
      const v = explicitRaw[f];
      if (v !== undefined) {
        out[f] = typeof v === "string" ? v : String(v);
      }
    }
    return Object.freeze(out) as Readonly<Record<TFieldNames, string>>;
  }
  return extractRawRecordFromFormData<TFieldNames>(formData, fields);
}
