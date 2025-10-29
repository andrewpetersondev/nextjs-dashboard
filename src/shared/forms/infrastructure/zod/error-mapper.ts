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
export function mapZodErrorToDenseFieldErrors<Tfieldnames extends string>(
  error: z.ZodError,
  allowedFields: readonly Tfieldnames[],
): DenseFieldErrorMap<Tfieldnames, string> {
  const { fieldErrors } = z.flattenError(error);
  const sparse = selectSparseFieldErrors<Tfieldnames, string>(
    fieldErrors,
    allowedFields,
  );
  return toDenseFieldErrorMap<Tfieldnames, string>(sparse, allowedFields);
}
