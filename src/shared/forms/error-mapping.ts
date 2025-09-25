/**
 * @file Map validation errors to UI-friendly shapes.
 *
 * Transforms sparse/dense error maps scoped to allowed field names.
 */

import type { z } from "zod";
import type {
  DenseErrorMap,
  FieldError,
  FormMessage,
  FormState,
  SparseErrorMap,
} from "@/shared/forms/form-types";
import { isZodErrorLike } from "@/shared/forms/zod-error";

/**
 * Type guard to assert a readonly array is non-empty.
 */
export function isNonEmpty<T>(
  arr: readonly T[] | undefined | null,
): arr is readonly [T, ...T[]] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Build a sparse error map restricted to allowed fields.
 *
 * Keeps only fields present in allowedFields and with non-empty errors.
 *
 * @typeParam TFieldNames - String-literal union of allowed field names.
 * @typeParam TMsg - Message type (defaults to FormMessage).
 * @param fieldErrors - Source errors keyed by field; values may be undefined.
 * @param allowedFields - Field names to include.
 * @returns Sparse error map with only allowed fields that have errors.
 * @example
 * ```typescript
 * const all = { email: ["Invalid"], password: undefined, other: ["x"] };
 * const allowed = ["email", "password"] as const;
 * const sparse = toSparseErrors(all, allowed); // { email: ["Invalid"] }
 * ```
 */
export function toSparseErrors<TFieldNames extends string, TMsg = FormMessage>(
  fieldErrors:
    | Partial<Record<TFieldNames, readonly TMsg[] | undefined>>
    | Record<string, readonly TMsg[] | undefined>,
  allowedFields: readonly TFieldNames[],
): SparseErrorMap<TFieldNames, TMsg> {
  const errors: SparseErrorMap<TFieldNames, TMsg> = {};
  for (const key of allowedFields) {
    const maybeErrors = (
      fieldErrors as Record<string, readonly TMsg[] | undefined>
    )[key];
    if (isNonEmpty(maybeErrors)) {
      errors[key] = maybeErrors as FieldError<TMsg>;
    }
  }
  return errors;
}

// Type-safe dense map factory
export function makeEmptyDenseErrors<TField extends string>(
  fields: readonly TField[],
): Readonly<Record<TField, readonly string[]>> {
  const acc = {} as Record<TField, readonly string[]>;
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
export function sparseToDense<TField extends string, TMsg = FormMessage>(
  sparse: SparseErrorMap<TField, TMsg>,
  fields: readonly TField[],
): DenseErrorMap<TField, TMsg> {
  const acc = {} as Record<TField, readonly TMsg[]>;
  for (const f of fields) {
    const errs = sparse[f];
    // Ensure we always return a readonly array; copy to avoid sharing references.
    acc[f] = isNonEmpty(errs) ? (errs.slice() as readonly TMsg[]) : [];
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
export function denseToSparse<TField extends string, TMsg = FormMessage>(
  dense: DenseErrorMap<TField, TMsg>,
): SparseErrorMap<TField, TMsg> {
  const out: Partial<Record<TField, FieldError<TMsg>>> = {};
  for (const [k, v] of Object.entries(dense) as [TField, readonly TMsg[]][]) {
    if (isNonEmpty(v)) {
      out[k] = v as FieldError<TMsg>;
    }
  }
  return out;
}

/**
 * Convert sparse errors to dense for allowed fields.
 *
 * Alias-friendly wrapper around {@link sparseToDense}.
 *
 * @typeParam TFieldNames - String-literal union of allowed field names.
 * @typeParam TMsg - Message type (defaults to FormMessage).
 * @param errors - Sparse error map.
 * @param allowedFields - All fields to include in the output.
 * @returns Dense error map with empty arrays for fields without errors.
 * @example
 * ```typescript
 * const sparse = { email: ["Invalid"] } as const;
 * const fields = ["email", "password"] as const;
 * const dense = toDenseErrors(sparse, fields); // { email: ["Invalid"], password: [] }
 * ```
 */
export function toDenseErrors<TFieldNames extends string, TMsg = FormMessage>(
  errors: SparseErrorMap<TFieldNames, TMsg>,
  allowedFields: readonly TFieldNames[],
): DenseErrorMap<TFieldNames, TMsg> {
  // Delegate to the canonical implementation.
  return sparseToDense(errors, allowedFields);
}

/**
 * Backward-compatible aliases (deprecated).
 *
 * Prefer: toSparseErrors, makeEmptyDenseErrors, sparseToDense, denseToSparse, toDenseErrors.
 */
export const mapFieldErrors = toSparseErrors;
export const toDenseFormErrors = toDenseErrors;

/**
 * Creates an initial failure state for a given set of form fields.
 */
export function createInitialFailureState<TFieldNames extends string>(
  fieldNames: readonly TFieldNames[],
) {
  return {
    errors: makeEmptyDenseErrors(fieldNames),
    message: "",
    success: false,
  } satisfies Extract<FormState<TFieldNames>, { success: false }>;
}

/**
 * Creates an initial failure state for a given Zod object schema.
 */
export function createInitialFailureStateFromSchema<
  S extends z.ZodObject<z.ZodRawShape>,
>(schema: S) {
  // Derive the field names directly from the schema
  type FieldNames = keyof S["shape"] & string;

  // Object.keys always returns string[], but narrowing it to FieldNames is safe here
  const fields = Object.keys(schema.shape) as readonly FieldNames[];

  return createInitialFailureState<FieldNames>(fields);
}

/**
 * Convert a Zod error to dense, per-field errors aligned with known fields.
 *
 * Falls back to an empty dense map when the error shape is not Zod-like.
 */
export function toDenseErrors_ValidateForm<TFieldNames extends string>(
  schemaError: unknown,
  fields: readonly TFieldNames[],
): DenseErrorMap<TFieldNames> {
  if (
    isZodErrorLike(schemaError) &&
    typeof schemaError.flatten === "function"
  ) {
    const flattened = schemaError.flatten();
    const normalized = mapFieldErrors(flattened.fieldErrors, fields);
    return toDenseFormErrors(normalized, fields);
  }
  return toDenseFormErrors<TFieldNames>({}, fields);
}
