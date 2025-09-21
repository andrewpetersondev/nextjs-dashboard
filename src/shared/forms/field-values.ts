/**
 * @file Helpers for extracting user-displayable field values from a raw payload.
 * Values are filtered to strings and optionally redacted by field name.
 */
import type { FormValues } from "@/shared/forms/form-types";

/**
 * Builds a partial record of user-displayable string values from a raw payload.
 *
 * Use cases:
 * - Echoing form inputs back to the UI after server-side validation.
 * - Constructing initial form states while omitting sensitive fields.
 *
 * Behavior:
 * - Iterates only over the provided `fields` list.
 * - Skips any field listed in `redactFields`.
 * - Includes only values that are of type `string` in the output.
 * - Ignores non-string values (e.g., File, number) to avoid unsafe coercion.
 *
 * Type parameters:
 * - TFieldNames: union of field name string literals.
 *
 * @param raw - Arbitrary raw payload keyed by field name.
 * @param fields - Ordered list of field names to consider for extraction.
 * @param redactFields - Field names that must not be included in the result (e.g., passwords).
 * @returns A partial record mapping field names to their string values.
 */
export function buildDisplayValues<TFieldNames extends string>(
  raw: Record<string, unknown>,
  fields: readonly TFieldNames[],
  redactFields: readonly TFieldNames[],
): FormValues<TFieldNames> {
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
