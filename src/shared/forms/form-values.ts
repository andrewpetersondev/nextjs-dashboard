import type { FormValueMap } from "@/shared/forms/form-types";

/**
 * Builds a partial record of user-displayable string values from a raw payload.
 *
 * @typeParam TFieldNames - Union of field name string literals.
 *
 * @param raw - Arbitrary raw payload keyed by field name.
 * @param fields - Ordered list of field names to consider for extraction.
 * @param redactFields - Field names that must not be included in the result (e.g., passwords).
 *
 * @returns A partial record mapping field names to their string values.
 *
 * @remarks
 * - Only values of type `string` are included.
 * - Fields listed in {@link redactFields} are skipped.
 * - Non-string values (e.g., File, number) are ignored to prevent unsafe coercion.
 *
 * @example
 * ```ts
 * const raw = { email: "a@b.com", avatar: new File([], "x"), password: "secret" };
 * const fields = ["email", "avatar", "password"] as const;
 * const redacted = ["password"] as const;
 * const values = buildDisplayValues(raw, fields, redacted);
 * // values -> { email: "a@b.com" }
 * ```
 */
export function buildDisplayValues<TFieldNames extends string>(
  raw: Record<string, unknown>,
  fields: readonly TFieldNames[],
  redactFields: readonly TFieldNames[],
): FormValueMap<TFieldNames> {
  // Result is partial because not every field will have a string value present.
  const values: Partial<Record<TFieldNames, string>> = {};

  // Iterate only over allowed fields to avoid leaking unexpected keys.
  for (const key of fields) {
    // Skip sensitive fields (e.g., password) from being echoed back.
    if (redactFields.includes(key)) {
      continue;
    }

    // Read raw value for the current key.
    const v = raw[key as string];

    // Only expose string values; ignore files/numbers/booleans/etc.
    if (typeof v === "string") {
      values[key] = v;
    }
  }

  return values;
}

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
