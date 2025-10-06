/**
 * Extract a plain raw record from a FormData instance, restricted to known field names.
 *
 * @typeParam TFieldNames - String literal union of allowed field names.
 *
 * @param formData - Source FormData to read from.
 * @param fields - If non-empty, only these keys are read (order preserved).
 *                 If empty, all unique keys present in formData are used.
 *
 * @returns A record of present keys and their values from formData.
 */
export function extractRawRecordFromFormData<TFieldNames extends string>(
  formData: FormData,
  fields: readonly TFieldNames[],
): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  // Determine keys once: either the provided whitelist or all keys from FormData.
  const keys: string[] =
    fields.length > 0
      ? (fields as readonly string[]).slice()
      : Array.from(new Set(Array.from(formData.keys())));

  // Copy only present entries to avoid undefined/null leaks.
  for (const key of keys) {
    const v = formData.get(key);
    if (v !== null) {
      raw[key] = v;
    }
  }
  return raw;
}
