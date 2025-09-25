/**
 * @file Zod error adapters: normalize ZodError into project error shapes.
 *
 * Responsibilities:
 * - Flatten Zod errors to fieldErrors/formErrors via Zod's API.
 * - Map flattened fieldErrors to sparse and dense shapes scoped to allowed fields.
 *
 * Keep: dense internally for determinism, sparse for UI.
 */

import { ZodError, ZodObject, type ZodRawShape, type ZodTypeAny, z } from "zod";
import {
  mapFieldErrors,
  toDenseFormErrors,
} from "@/shared/forms/error-mapping";
import type { DenseErrorMap, SparseErrorMap } from "@/shared/forms/form-types";

/** Shape emitted by z.ZodError#flatten().fieldErrors */
export type ZodFieldErrors = Record<string, string[] | undefined>;

/**
 * Flatten a ZodError using Zod's built-in API, normalizing optional properties.
 * Always returns arrays for formErrors and preserves fieldErrors sparsity.
 */
export function flattenZodError(error: z.ZodError): {
  fieldErrors: ZodFieldErrors;
  formErrors: readonly string[];
} {
  const flattened = z.flattenError(error);
  return {
    fieldErrors: flattened.fieldErrors as ZodFieldErrors,
    formErrors: flattened.formErrors ?? [],
  };
}

/**
 * Build sparse errors limited to allowed fields from a ZodError.
 * Only fields present in allowedFields may appear in the returned map.
 */
export function zodToSparseErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): SparseErrorMap<TFieldNames> {
  const { fieldErrors } = flattenZodError(error);
  return mapFieldErrors(fieldErrors, allowedFields);
}

/**
 * Build dense errors aligned to allowed fields from a ZodError.
 * The returned object contains every allowed field (possibly empty arrays).
 */
export function zodToDenseErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): DenseErrorMap<TFieldNames> {
  const sparse = zodToSparseErrors(error, allowedFields);
  return toDenseFormErrors(sparse, allowedFields);
}

/**
 * Determine whether a given Zod schema is a {@link ZodObject}.
 *
 * @param schema - Any Zod schema instance.
 * @returns True if the schema is an object schema; otherwise, false.
 *
 * @example
 * ```ts
 * if (isZodObject(schema)) {
 *   // schema is narrowed to ZodObject<ZodRawShape>
 *   const keys = Object.keys(schema.shape);
 * }
 * ```
 */
export function isZodObject(
  schema: ZodTypeAny,
): schema is ZodObject<ZodRawShape> {
  return schema instanceof ZodObject;
}

/**
 * Determine whether a value is a {@link ZodError}.
 *
 * @param err - Unknown value to test.
 * @returns True if the value is a ZodError; otherwise, false.
 *
 * @example
 * ```ts
 * try {
 *   schema.parse(input);
 * } catch (e) {
 *   if (isZodError(e)) {
 *     // Access Zod-specific error formatting
 *     const issues = e.issues;
 *   }
 * }
 * ```
 */
export function isZodError(err: unknown): err is ZodError {
  return err instanceof ZodError;
}
