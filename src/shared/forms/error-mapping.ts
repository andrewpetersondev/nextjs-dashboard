/**
 * @file Map validation errors to UI-friendly shapes.
 *
 * Transforms sparse/dense error maps scoped to allowed field names.
 */

import type {
  DenseErrorMap,
  FieldError,
  FormMessage,
  SparseErrorMap,
} from "@/shared/forms/form-types";

/**
 * Build a sparse error map restricted to allowed fields.
 *
 * Keeps only fields present in allowedFields and with non-empty errors.
 *
 * @typeParam TFieldNames - String-literal union of allowed field names.
 * @param fieldErrors - Source errors keyed by field; values may be undefined.
 * @param allowedFields - Field names to include.
 * @returns Sparse error map with only allowed fields that have errors.
 * @example
 * ```typescript
 * const all = { email: ["Invalid"], password: undefined, other: ["x"] };
 * const allowed = ["email", "password"] as const;
 * const sparse = mapFieldErrors(all, allowed); // { email: ["Invalid"] }
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
      // Assert non-empty readonly tuple to satisfy FieldError
      errors[key] = maybeErrors as unknown as readonly [string, ...string[]];
    }
  }
  return errors;
}

/**
 * Create a dense error map with empty arrays for all fields.
 *
 * @typeParam TField - String-literal union of field names.
 * @typeParam TMsg - Message type (defaults to FormMessage).
 * @param fields - All field names to initialize.
 * @returns Dense map where each field has [].
 */
export function makeEmptyDenseErrors<TField extends string, TMsg = FormMessage>(
  fields: readonly TField[],
): DenseErrorMap<TField, TMsg> {
  const acc = {} as Record<TField, readonly TMsg[]>;
  for (const f of fields) {
    acc[f] = [];
  }
  return acc;
}

/**
 * Convert sparse errors to a dense per-field map.
 *
 * Copies arrays to avoid sharing references; empty arrays for missing fields.
 *
 * @typeParam TField - String-literal union of field names.
 * @typeParam TMsg - Message type (defaults to FormMessage).
 * @param sparse - Sparse error map (only fields with errors).
 * @param fields - All field names to represent.
 * @returns Dense map with every field present.
 */
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

/**
 * Convert dense errors to sparse by removing empty entries.
 *
 * @typeParam TField - String-literal union of field names.
 * @typeParam TMsg - Message type (defaults to FormMessage).
 * @param dense - Dense error map with all fields.
 * @returns Sparse map with only fields that have errors.
 */
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
 * Convert sparse errors to dense for allowed fields.
 *
 * Alias-friendly wrapper around {@link fromSparseToDenseErrors}.
 *
 * @typeParam TFieldNames - String-literal union of allowed field names.
 * @param errors - Sparse error map.
 * @param allowedFields - All fields to include in the output.
 * @returns Dense error map with empty arrays for fields without errors.
 * @example
 * ```typescript
 * const sparse = { email: ["Invalid"] } as const;
 * const fields = ["email", "password"] as const;
 * const dense = toDenseFormErrors(sparse, fields); // { email: ["Invalid"], password: [] }
 * ```
 */
export function sparseToDenseFormErrors<TFieldNames extends string>(
  errors: SparseErrorMap<TFieldNames>,
  allowedFields: readonly TFieldNames[],
): DenseErrorMap<TFieldNames> {
  // Delegate to the canonical implementation.
  return fromSparseToDenseErrors(errors, allowedFields);
}

/**
 * Alias of {@link sparseToDenseFormErrors}.
 *
 * @see sparseToDenseFormErrors
 */
export const toDenseFormErrors = sparseToDenseFormErrors;
