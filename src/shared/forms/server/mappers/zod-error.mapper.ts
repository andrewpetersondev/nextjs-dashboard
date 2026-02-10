import "server-only";
import { z } from "zod";
import type { DenseFieldErrorMap } from "@/shared/forms/core/types/field-error.types";
import type {
  ValidationErrors,
  ZodErrorLike,
} from "@/shared/forms/core/types/validation.types";
import {
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/logic/mappers/field-error-map.mapper";

/**
 * Adapts a ZodError (foreign) into a canonical representation of field and form errors.
 */
export function fromZodError<T extends string>(
  error: ZodErrorLike,
  fields: readonly T[],
): ValidationErrors<T, string> {
  const { fieldErrors, formErrors } = z.flattenError(error as z.ZodError);

  const sparse = selectSparseFieldErrors<T, string>(fieldErrors, fields);

  return {
    fieldErrors: toDenseFieldErrorMap<T, string>(sparse, fields),
    formErrors: Object.freeze(formErrors),
  };
}

/**
 * Adapts a ZodError (foreign) into a DenseFieldErrorMap (canonical).
 */
export function toDenseFieldErrorMapFromZod<T extends string>(
  error: z.ZodError,
  fields: readonly T[],
): DenseFieldErrorMap<T, string> {
  return fromZodError(error, fields).fieldErrors;
}
