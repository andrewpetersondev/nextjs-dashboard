/**
 * @file Utilities for converting FormData into a plain object suitable for validation and UI echoing.
 *
 * The helpers intentionally preserve original values (including File) without coercion.
 *
 * @remarks
 * Use when you need a simple key-value map from a FormData payload while
 * retaining the original types returned by the underlying FormData API.
 */

/**
 * Builds a plain "raw" record from a FormData instance limited to a known set of field names.
 *
 * @typeParam TFieldNames - String literal union of allowed field names to improve downstream type safety.
 *
 * @param formData - Source FormData to read from.
 * @param fields - If non-empty, only these keys are read (order preserved by a shallow copy).
 * If empty, all unique keys present in {@link formData} are used.
 *
 * @returns A record of present keys and their values from {@link formData}.
 *
 * @remarks
 * - Only keys with non-null values are included (skips absent entries).
 * - Values are preserved as-is (could be string, File, or other FormData-supported types).
 * - No parsing or normalization is performed.
 * - For multi-valued fields, `FormData.get` returns only the first value. Use `FormData.getAll`
 *   upstream if you need all values and adapt this helper accordingly.
 *
 * @example
 * ```ts
 * const raw = formDataToRawMap(formData, ["email", "username"] as const);
 * // -> { email: "a@b.com", username: "alice" }
 * ```
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
