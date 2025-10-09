/**
 * Extract a plain raw record from a FormData instance, restricted to known field names.
 *
 * - Returns a readonly record keyed by the exact allowed field union.
 * - Coerces File/Blob values to string via String(v) to avoid non-serializable payloads.
 */
export function extractRawRecordFromFormData<TFieldNames extends string>(
  formData: FormData,
  fields: readonly TFieldNames[],
): Readonly<Record<TFieldNames, string>> {
  const out: Partial<Record<TFieldNames, string>> = {};
  const keys: readonly (string | TFieldNames)[] =
    fields.length > 0
      ? fields
      : (Array.from(new Set(Array.from(formData.keys()))) as readonly string[]);

  for (const key of keys) {
    const k = key as string;
    const v = formData.get(k);
    if (v !== null && (fields as readonly string[]).includes(k)) {
      out[k as TFieldNames] = typeof v === "string" ? v : String(v);
    }
  }
  return Object.freeze(out) as Readonly<Record<TFieldNames, string>>;
}
