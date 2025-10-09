import type { z } from "zod";
import {
  createEmptyDenseFieldErrorMap,
  selectSparseFieldErrorsForAllowedFields,
  toDenseFieldErrorMapFromSparse,
} from "@/shared/forms/errors/dense-error-map";
import {
  flattenZodError,
  isZodErrorLikeShape,
} from "@/shared/forms/errors/zod-error.helpers";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type { SparseFieldErrorMap } from "@/shared/forms/types/sparse.types";

/**
 * Build sparse errors limited to allowed fields from a ZodError.
 * Only fields present in allowedFields may appear in the returned map.
 */
export function mapZodErrorToSparseFieldErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): SparseFieldErrorMap<TFieldNames> {
  const { fieldErrors } = flattenZodError(error);
  return selectSparseFieldErrorsForAllowedFields<TFieldNames, string>(
    fieldErrors,
    allowedFields,
  );
}

/**
 * Build dense errors aligned to allowed fields from a ZodError.
 * The returned object contains every allowed field (possibly empty arrays).
 */
export function mapZodErrorToDenseFieldErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): DenseFieldErrorMap<TFieldNames> {
  const sparse = mapZodErrorToSparseFieldErrors(error, allowedFields);
  return toDenseFieldErrorMapFromSparse(sparse, allowedFields);
}

/**
 * Convert a Zod-like error to dense, per-field errors aligned with known fields.
 * Falls back to an empty dense map when the error shape is not Zod-like.
 */
export function mapToDenseFieldErrorsFromZod<TFieldNames extends string>(
  schemaError: unknown,
  fields: readonly TFieldNames[],
): DenseFieldErrorMap<TFieldNames> {
  if (
    isZodErrorLikeShape(schemaError) &&
    typeof schemaError.flatten === "function"
  ) {
    const flattened = schemaError.flatten();
    const sparse = selectSparseFieldErrorsForAllowedFields<TFieldNames, string>(
      flattened.fieldErrors,
      fields,
    );
    return toDenseFieldErrorMapFromSparse(sparse, fields);
  }
  return createEmptyDenseFieldErrorMap(fields);
}
