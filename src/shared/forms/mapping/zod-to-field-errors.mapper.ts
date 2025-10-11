import type { ZodError, z } from "zod";
import {
  selectSparseFieldErrorsForAllowedFields,
  toDenseFieldErrorMapFromSparse,
} from "@/shared/forms/errors/dense-error-map";
import { flattenZodError } from "@/shared/forms/errors/zod-error.helpers";
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
 * Map Zod issues to dense field error map of readonly string[] (can be empty).
 */
export function mapToDenseFieldErrorsFromZod<TField extends string>(
  error: Pick<ZodError<unknown>, "issues">,
  fields: readonly TField[],
): DenseFieldErrorMap<TField, readonly string[]> {
  const sparse: Partial<Record<TField, readonly string[]>> = {};
  for (const issue of error.issues ?? []) {
    const pathKey = String(issue.path?.[0] ?? "");
    if (fields.includes(pathKey as TField)) {
      const k = pathKey as TField;
      const prev = sparse[k] ?? [];
      sparse[k] = Object.freeze([...prev, issue.message]);
    }
  }
  return toDenseFieldErrorMapFromSparse<TField, string>(
    sparse as SparseFieldErrorMap<TField, string>,
    fields,
  );
}
