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

import type {
  DenseErrorMap,
  FieldError,
  FormMessage,
  SparseErrorMap,
} from "@/shared/forms/form-types";

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
): SparseErrorMap<TFieldNames> {
  const errors: SparseErrorMap<TFieldNames> = {};
  for (const key of allowedFields) {
    const maybeErrors = fieldErrors[key];
    if (Array.isArray(maybeErrors) && maybeErrors.length > 0) {
      // Assert non-empty readonly tuple to satisfy FormFieldError
      errors[key] = maybeErrors as unknown as readonly [string, ...string[]];
    }
  }
  return errors;
}

export function makeEmptyDenseErrors<TField extends string, TMsg = FormMessage>(
  fields: readonly TField[],
): DenseErrorMap<TField, TMsg> {
  const acc = {} as Record<TField, readonly TMsg[]>;
  for (const f of fields) {
    acc[f] = [];
  }
  return acc;
}

export function fromSparseToDenseErrors<
  TField extends string,
  TMsg = FormMessage,
>(
  sparse: SparseErrorMap<TField, TMsg>,
  fields: readonly TField[],
): DenseErrorMap<TField, TMsg> {
  const acc = {} as Record<TField, readonly TMsg[]>;
  for (const f of fields) {
    const errs = sparse[f];
    // Ensure we always return a readonly array; copy to avoid sharing references.
    acc[f] = errs && errs.length > 0 ? (errs.slice() as readonly TMsg[]) : [];
  }
  return acc;
}

export function denseToSparseErrors<TField extends string, TMsg = FormMessage>(
  dense: DenseErrorMap<TField, TMsg>,
): SparseErrorMap<TField, TMsg> {
  const out: Partial<Record<TField, FieldError<TMsg>>> = {};
  for (const [k, v] of Object.entries(dense) as [TField, readonly TMsg[]][]) {
    if (v.length > 0) {
      out[k] = v as FieldError<TMsg>;
    }
  }
  return out;
}

/**
 * Converts a sparse {@link SparseErrorMap} map into a dense, per-field error map.
 *
 * @remarks
 * - Preferred name: `sparseToDenseFormErrors`.
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
export function sparseToDenseFormErrors<TFieldNames extends string>(
  errors: SparseErrorMap<TFieldNames>,
  allowedFields: readonly TFieldNames[],
): DenseErrorMap<TFieldNames> {
  // Delegate to the canonical implementation.
  return fromSparseToDenseErrors(errors, allowedFields);
}

/** Backward-compatible alias. */
export const toDenseFormErrors = sparseToDenseFormErrors;
