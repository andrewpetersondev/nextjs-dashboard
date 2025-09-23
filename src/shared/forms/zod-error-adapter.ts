/**
 * @file Zod error adapters: normalize ZodError into project error shapes.
 *
 * Responsibilities:
 * - Flatten Zod errors to fieldErrors/formErrors via Zod's API.
 * - Map flattened fieldErrors to sparse and dense shapes scoped to allowed fields.
 *
 * Keep: dense internally for determinism, sparse for UI.
 */

import type { z } from "zod";
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
  const flattened = error.flatten();
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
