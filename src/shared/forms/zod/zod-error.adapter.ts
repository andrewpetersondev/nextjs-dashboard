import { z } from "zod";
import {
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/factories/field-error-map.factory";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-error.value";

/**
 * Adapts a ZodError (foreign) into a DenseFieldErrorMap (canonical).
 */
export function fromZodError<T extends string>(
  error: z.ZodError,
  fields: readonly T[],
): DenseFieldErrorMap<T, string> {
  const { fieldErrors, formErrors } = z.flattenError(error);

  // TODO: include form errors at some point
  console.log("eventually include form errors", formErrors);

  const sparse = selectSparseFieldErrors<T, string>(fieldErrors, fields);

  return toDenseFieldErrorMap<T, string>(sparse, fields);
}
