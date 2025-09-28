/**
 * @file Map validation errors to UI-friendly shapes.
 *
 * Transforms sparse/dense error maps scoped to allowed field names.
 */

import type { z } from "zod";
import type {
  DenseFieldErrorMap,
  FieldError,
  FormState,
  SparseFieldErrorMap,
} from "@/shared/forms/form-types";
import { isZodErrorLikeShape } from "@/shared/forms/zod-error";

/* -------------------------------------------------------------------------- */
/* Predicates                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Type guard to assert a readonly array is non-empty.
 */
export function hasItems<T>(
  arr: readonly T[] | undefined | null,
): arr is readonly [T, ...T[]] {
  return Array.isArray(arr) && arr.length > 0;
}

/* -------------------------------------------------------------------------- */
/* Sparse / Dense conversions                                                  */
/* -------------------------------------------------------------------------- */

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
export function pickAllowedSparseFieldErrors<
  TFieldNames extends string,
  TMsg = string,
>(
  fieldErrors:
    | Partial<Record<TFieldNames, readonly TMsg[] | undefined>>
    | Record<string, readonly TMsg[] | undefined>,
  allowedFields: readonly TFieldNames[],
): SparseFieldErrorMap<TFieldNames, TMsg> {
  const errors: SparseFieldErrorMap<TFieldNames, TMsg> = {};
  for (const key of allowedFields) {
    const maybeErrors = (
      fieldErrors as Record<string, readonly TMsg[] | undefined>
    )[key];
    if (hasItems(maybeErrors)) {
      errors[key] = maybeErrors as FieldError<TMsg>;
    }
  }
  return errors;
}

/**
 * Create an *empty* dense error map for the given fields (every key present, all `[]` and frozen).
 *
 * Useful when you need a canonical dense shape (e.g., initial UI state).
 *
 * @example
 * ```ts
 * const empty = makeEmptyDenseErrors(["email", "password"]);
 * // { email: [], password: [] }
 * ```
 */
export function buildEmptyDenseErrorMap<TField extends string, TMsg = string>(
  fields: readonly TField[],
): DenseFieldErrorMap<TField, TMsg> {
  const result: Partial<Record<TField, readonly TMsg[]>> = {};
  for (const f of fields) {
    result[f] = Object.freeze([]) as readonly TMsg[];
  }
  return Object.freeze(result) as DenseFieldErrorMap<TField, TMsg>;
}

/**
 * Convert a sparse error map (only errored keys present) into a dense error map.
 *
 * - Keys missing from `sparse` will be set to `[]` (frozen copies).
 * - Preserves the order of `fields` passed in.
 */
export function expandSparseErrorsToDense<TField extends string, TMsg = string>(
  sparse: SparseFieldErrorMap<TField, TMsg> | undefined,
  fields: readonly TField[],
): DenseFieldErrorMap<TField, TMsg> {
  const out: Partial<Record<TField, readonly TMsg[]>> = {};
  for (const f of fields) {
    const v = sparse?.[f];
    out[f] = Array.isArray(v)
      ? (Object.freeze([...v]) as readonly TMsg[])
      : (Object.freeze([]) as readonly TMsg[]);
  }
  return Object.freeze(out) as DenseFieldErrorMap<TField, TMsg>;
}

/**
 * Convert a dense error map into a sparse error map (only keys whose array length > 0 are kept).
 *
 * - Fields whose array is `[]` are omitted from the result.
 * - Result uses `FieldError` (non-empty readonly arrays) for values.
 */
export function compactDenseErrorsToSparse<
  TField extends string,
  TMsg = string,
>(dense: DenseFieldErrorMap<TField, TMsg>): SparseFieldErrorMap<TField, TMsg> {
  const out: Partial<Record<TField, FieldError<TMsg>>> = {};

  // Iterate over all keys in the dense map
  for (const k in dense) {
    const arr = dense[k];

    // Only assign to out if the array exists and has elements
    if (arr && arr.length > 0) {
      // At runtime we just check length; casting to FieldError<TMsg> for TS type
      out[k as TField] = arr as FieldError<TMsg>;
    }
  }

  return out as SparseFieldErrorMap<TField, TMsg>;
}

/* -------------------------------------------------------------------------- */
/* Builders                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Creates an initial failure state for a given set of form fields.
 */
export function buildInitialFailedFormState<TFieldNames extends string>(
  fieldNames: readonly TFieldNames[],
) {
  return {
    errors: buildEmptyDenseErrorMap(fieldNames),
    message: "",
    success: false,
  } satisfies Extract<FormState<TFieldNames>, { success: false }>;
}

/**
 * Creates an initial failure state for a given Zod object schema.
 */
export function buildInitialFailedFormStateFromSchema<
  S extends z.ZodObject<z.ZodRawShape>,
>(schema: S) {
  // Derive the field names directly from the schema
  type FieldNames = keyof S["shape"] & string;

  // Object.keys always returns string[], but narrowing it to FieldNames is safe here
  const fields = Object.keys(schema.shape) as readonly FieldNames[];
  return buildInitialFailedFormState<FieldNames>(fields);
}

/* -------------------------------------------------------------------------- */
/* Zod integration                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Convert a Zod-like error to dense, per-field errors aligned with known fields.
 * Falls back to an empty dense map when the error shape is not Zod-like.
 */
export function toDenseFieldErrorsFromZod<TFieldNames extends string>(
  schemaError: unknown,
  fields: readonly TFieldNames[],
): DenseFieldErrorMap<TFieldNames> {
  if (
    isZodErrorLikeShape(schemaError) &&
    typeof schemaError.flatten === "function"
  ) {
    const flattened = schemaError.flatten();
    const sparse = pickAllowedSparseFieldErrors<TFieldNames, string>(
      flattened.fieldErrors,
      fields,
    );
    return expandSparseErrorsToDense(sparse, fields);
  }
  return buildEmptyDenseErrorMap(fields);
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validate & freeze a dense error map.
 */
export function assertAndFreezeDenseErrorMap<TField extends string, TMsg>(
  fields: readonly TField[],
  dense: Record<TField, readonly TMsg[]>,
): DenseFieldErrorMap<TField, TMsg> {
  for (const f of fields) {
    if (!(f in dense)) {
      throw new Error(`Missing field in dense error map: ${f}`);
    }
    if (!Array.isArray(dense[f])) {
      throw new Error(`Invalid value for field ${f}`);
    }
  }
  // Freeze inner arrays (copy) and then freeze the object to prevent mutation leakage
  const normalized = Object.fromEntries(
    fields.map((f) => [f, Object.freeze([...(dense[f] as readonly TMsg[])])]),
  ) as Record<TField, readonly TMsg[]>;
  return Object.freeze(normalized) as DenseFieldErrorMap<TField, TMsg>;
}

/* -------------------------------------------------------------------------- */
/* repo/service error mapping helpers                                     */
/* -------------------------------------------------------------------------- */

/**
 * Attach a single message to a chosen field (defaults to the first field),
 * returning a fully dense error map.
 *
 * @example
 * toRootDenseMessage(["email","password"], "Something failed") // puts message on "email"
 */
export function attachRootDenseMessageToField<
  TField extends string,
  TMsg = string,
>(
  fields: readonly TField[],
  message: TMsg,
  opts?: { field?: TField },
): DenseFieldErrorMap<TField, TMsg> {
  const dense = buildEmptyDenseErrorMap<TField, TMsg>(fields);
  const target =
    opts?.field ?? (fields[0] as TField | undefined) ?? ("" as TField);
  // If fields list might be empty, fall back to returning the empty dense map.
  if (!target || !fields.includes(target)) {
    return dense;
  }
  return assertAndFreezeDenseErrorMap(fields, {
    ...dense,
    [target]: Object.freeze([message]) as readonly TMsg[],
  } as Record<TField, readonly TMsg[]>);
}

/**
 * Map an unknown repository/service error into a DenseErrorMap suitable for forms.
 *
 * Strategy:
 * - Prefer safe, user-facing message from known error types.
 * - Fall back to a generic message.
 * - Attach to the first field (or provided field) to keep UI wiring simple.
 */
export function mapRepoErrorToDenseFieldErrors<TField extends string>(
  error: unknown,
  fields: readonly TField[],
  opts?: {
    field?: TField;
    /**
     * Provide a function to extract a user-facing message from a known domain error.
     * If omitted, best-effort extraction is attempted.
     */
    toMessage?: (e: unknown) => string | undefined;
    /** Fallback message if nothing can be extracted. */
    defaultMessage?: string;
  },
): DenseFieldErrorMap<TField> {
  const defaultMsg =
    opts?.defaultMessage ?? "Operation failed. Please try again.";
  const extract =
    opts?.toMessage ??
    ((e: unknown) => {
      // Best-effort extraction without leaking internals.
      if (
        typeof e === "object" &&
        e &&
        "message" in e &&
        typeof (e as any).message === "string"
      ) {
        return (e as { message: string }).message;
      }
      return;
    });

  const msg = extract(error) ?? defaultMsg;
  return attachRootDenseMessageToField(fields, msg, { field: opts?.field });
}
