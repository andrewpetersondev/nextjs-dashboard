import { z } from "zod";
import type { DenseFieldErrorMap } from "@/shared/forms/core/types/field-error.value";
import {
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/logic/factories/field-error-map.factory";

/**
 * Adapts a ZodError (foreign) into a DenseFieldErrorMap (canonical).
 */
export function toDenseFieldErrorMapFromZod<T extends string>(
  error: z.ZodError,
  fields: readonly T[],
): DenseFieldErrorMap<T, string> {
  const { fieldErrors, formErrors } = z.flattenError(error);

  // TODO: include form errors at some point
  console.log("eventually include form errors", formErrors);

  const sparse = selectSparseFieldErrors<T, string>(fieldErrors, fields);

  return toDenseFieldErrorMap<T, string>(sparse, fields);
}
