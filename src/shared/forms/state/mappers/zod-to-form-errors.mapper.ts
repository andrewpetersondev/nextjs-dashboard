import { z } from "zod";
import type { DenseFieldErrorMap } from "@/shared/forms/errors/types";
import {
  selectSparseFieldErrorsForAllowedFields,
  toDenseFieldErrorMapFromSparse,
} from "@/shared/forms/validation/error-map";

/**
 * Build dense errors aligned to allowed fields from a ZodError.
 * The returned object contains every allowed field (possibly empty arrays).
 */
export function mapZodErrorToDenseFieldErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): DenseFieldErrorMap<TFieldNames, string> {
  const { fieldErrors } = z.flattenError(error);
  const sparse = selectSparseFieldErrorsForAllowedFields<TFieldNames, string>(
    fieldErrors,
    allowedFields,
  );
  return toDenseFieldErrorMapFromSparse<TFieldNames, string>(
    sparse,
    allowedFields,
  );
}
