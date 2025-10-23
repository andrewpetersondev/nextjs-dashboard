import type { ZodError, z } from "zod";
import type { DenseFieldErrorMap } from "@/shared/forms/errors/types/dense.types";
import type { SparseFieldErrorMap } from "@/shared/forms/errors/types/sparse.types";
import {
  selectSparseFieldErrorsForAllowedFields,
  toDenseFieldErrorMapFromSparse,
} from "@/shared/forms/validation/dense-error-map";
import { flattenZodError } from "@/shared/forms/validation/utils/zod-error.helpers";

/**
 * Build sparse errors limited to allowed fields from a ZodError.
 * Only fields present in allowedFields may appear in the returned map.
 */
export function mapZodErrorToSparseFieldErrors<TFieldNames extends string>(
  error: z.ZodError,
  allowedFields: readonly TFieldNames[],
): SparseFieldErrorMap<TFieldNames, string> {
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
): DenseFieldErrorMap<TFieldNames, string> {
  const sparse = mapZodErrorToSparseFieldErrors(error, allowedFields);
  return toDenseFieldErrorMapFromSparse<TFieldNames, string>(
    sparse,
    allowedFields,
  );
}

/**
 * Map Zod issues to dense field error map of readonly string[] (can be empty).
 */
export function mapToDenseFieldErrorsFromZod<TField extends string>(
  error: Pick<ZodError<unknown>, "issues">,
  fields: readonly TField[],
): DenseFieldErrorMap<TField, string> {
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
