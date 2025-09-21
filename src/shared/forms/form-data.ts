/**
 * @file Utilities for converting FormData into a plain object suitable for validation and UI echoing.
 * The helpers intentionally preserve original values (including File) without coercion.
 */

/**
 * Builds a plain "raw" record from a FormData instance limited to a known set of field names.
 *
 * Behavior:
 * - If `fields` is non-empty, only those keys are read from `formData` (order preserved by a shallow copy).
 * - If `fields` is empty, all unique keys present in `formData` are used.
 * - Only keys with non-null values are included (skips absent/missing entries).
 * - Values are preserved as-is (could be string, File, or other FormData-supported types).
 *
 * Type parameters:
 * - TFieldNames: string literal union of allowed field names to improve downstream type-safety in callers.
 *
 * Notes:
 * - This function does not perform any parsing or normalization; it only mirrors the raw payload.
 * - For multi-valued fields (e.g., checkboxes with same name), FormData.get returns the first value.
 *   If you need all values, use FormData.getAll upstream and adapt this helper accordingly.
 *
 * Example:
 * const raw = formDataToRawMap(formData, ["email", "username"] as const);
 * // -> { email: "a@b.com", username: "alice" }
 */
export function formDataToRawMap<TFieldNames extends string>(
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
