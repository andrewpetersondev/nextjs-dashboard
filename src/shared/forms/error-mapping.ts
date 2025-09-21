/**
 * @file Error mapping helpers for transforming validation outputs into UI-friendly shapes.
 *
 * Provides sparse-to-dense conversions scoped to allowed field names.
 *
 * @remarks
 * Typical use cases:
 * - Filter a broad set of validation errors to a specific subset of form fields.
 * - Produce a dense error map suitable for UI rendering where each field always has an array
 *   (possibly empty) of user-facing error messages.
 */

import type { DenseFormErrors, FormErrors } from "@/shared/forms/form-types";

/**
 * Creates a sparse error map restricted to a set of allowed field names.
 *
 * @typeParam TFieldNames - Union of allowed field name string literals.
 *
 * @param fieldErrors - A record of potential field errors keyed by field name, where each value
 * can be an array of error messages or undefined.
 * @param allowedFields - List of field names that should be included in the result.
 *
 * @returns A sparse error object containing only fields from {@link allowedFields} that
 * have at least one error message.
 *
 * @example
 * ```ts
 * const allErrors = { email: ["Invalid email"], password: undefined, unexpected: ["x"] };
 * const allowed = ["email", "password"] as const;
 * const filtered = mapFieldErrors(allErrors, allowed);
 * // filtered -> { email: ["Invalid email"] }
 * ```
 */
export function mapFieldErrors<TFieldNames extends string>(
  fieldErrors: Record<string, string[] | undefined>,
  allowedFields: readonly TFieldNames[],
): FormErrors<TFieldNames> {
  const errors: FormErrors<TFieldNames> = {};
  for (const key of allowedFields) {
    const maybeErrors = fieldErrors[key];
    if (Array.isArray(maybeErrors) && maybeErrors.length > 0) {
      // Assert non-empty readonly tuple to satisfy FormFieldError
      errors[key] = maybeErrors as unknown as readonly [string, ...string[]];
    }
  }
  return errors;
}

/**
 * Converts a sparse {@link FormErrors} map into a dense, per-field error map.
 *
 * @typeParam TFieldNames - Union of allowed field name string literals.
 *
 * @param errors - Sparse error map where only fields with errors are present.
 * @param allowedFields - All field names that should be represented in the dense output.
 *
 * @returns A dense error map including every field from {@link allowedFields}, where fields
 * with no errors are represented by an empty readonly array.
 *
 * @example
 * ```ts
 * const sparse = { email: ["Invalid email"] } as const;
 * const fields = ["email", "password"] as const;
 * const dense = toDenseFormErrors(sparse, fields);
 * // dense -> { email: ["Invalid email"], password: [] }
 * ```
 */
export function toDenseFormErrors<TFieldNames extends string>(
  errors: FormErrors<TFieldNames>,
  allowedFields: readonly TFieldNames[],
): DenseFormErrors<TFieldNames> {
  const dense: Partial<Record<TFieldNames, readonly string[]>> = {};
  for (const key of allowedFields) {
    const e = errors[key];
    dense[key] = e ? (e as readonly string[]) : [];
  }
  return dense as DenseFormErrors<TFieldNames>;
}
