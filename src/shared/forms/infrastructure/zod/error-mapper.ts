import { z } from "zod";
import {
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/domain/factories/error-map.factory";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/models/error-maps";

/**
 * Build dense errors aligned to allowed fields from a ZodError.
 * The returned object contains every allowed field (possibly empty arrays).
 */
export function mapZodErrorToDenseFieldErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): DenseFieldErrorMap<TFieldNames, string> {
  const { fieldErrors } = z.flattenError(error);
  const sparse = selectSparseFieldErrors<TFieldNames, string>(
    fieldErrors,
    allowedFields,
  );
  return toDenseFieldErrorMap<TFieldNames, string>(sparse, allowedFields);
}
