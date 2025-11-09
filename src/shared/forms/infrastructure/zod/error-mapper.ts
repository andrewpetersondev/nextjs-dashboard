// src/shared/forms/infrastructure/zod/error-mapper.ts
import { z } from "zod";
import {
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/domain/factories/error-map.factory";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/models/error-maps";

/**
 * Build dense errors aligned to allowed fields from a {@link z.ZodError}.
 *
 * This flattens the Zod error, selects only allowed fields with errors, and returns a dense
 * field error map where every allowed field is present (missing entries become empty arrays).
 *
 * @typeParam Tfieldnames - Allowed field name union.
 * @param error - A {@link z.ZodError} instance to map.
 * @param allowedFields - Fields to include in the resulting map.
 * @returns A {@link DenseFieldErrorMap} mapping each allowed field to its array of error messages.
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
