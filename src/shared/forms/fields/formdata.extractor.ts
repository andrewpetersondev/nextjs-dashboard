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

/**
 * Extracts specified fields and their values from a FormData object.
 *
 * @param fd - The FormData object to extract fields from.
 * @param allowed - An array of allowed field names to pick.
 * @returns A readonly object containing the picked fields and their string values.
 */
export function pickFormDataFields<TAllowed extends string>(
  fd: FormData,
  allowed: readonly TAllowed[],
): Readonly<Partial<Record<TAllowed, string>>> {
  const out: Partial<Record<TAllowed, string>> = {};
  for (const k of allowed) {
    const v = fd.get(k);
    if (v !== null) {
      out[k] = typeof v === "string" ? v : String(v);
    }
  }
  return Object.freeze(out);
}
