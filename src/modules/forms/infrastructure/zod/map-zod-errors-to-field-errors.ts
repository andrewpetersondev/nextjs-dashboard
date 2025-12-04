import { z } from "zod";
import {
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/modules/forms/domain/factories/create-error-map.factory";
import type { DenseFieldErrorMap } from "@/modules/forms/domain/types/error-maps.types";

/**
 * Build dense errors aligned to allowed fields from a {@link z.ZodError}.
 *
 * This flattens the Zod error, selects only allowed fields with errors, and returns a dense
 * field error map where every allowed field is present (missing entries become empty arrays).
 *
 * @typeParam T - Allowed field name union.
 * @param error - A {@link z.ZodError} instance to map.
 * @param allowedFields - Fields to include in the resulting map.
 * @returns A {@link DenseFieldErrorMap} mapping each allowed field to its array of error messages.
 */
export function mapZodErrorToDenseFieldErrors<T extends string>(
  error: z.ZodError,
  allowedFields: readonly T[],
): DenseFieldErrorMap<T, string> {
  const { fieldErrors } = z.flattenError(error);
  const sparse = selectSparseFieldErrors<T, string>(fieldErrors, allowedFields);
  return toDenseFieldErrorMap<T, string>(sparse, allowedFields);
}
