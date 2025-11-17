import type { AppError } from "@/shared/errors/app-error/app-error";
import type { SparseFieldValueMap } from "@/shared/forms/domain/error-maps.types";

/**
 * Safely extract echoed field values from an AppError.
 * Returns undefined if not present.
 *
 * @example
 * const values = getFieldValues<'email' | 'username'>(appError);
 * if (values?.email) {
 *   console.log(values.email); // string
 * }
 */
export const getFieldValues = <Tfieldname extends string>(
  error: AppError,
): SparseFieldValueMap<Tfieldname, string> | undefined => {
  const extra = error.details?.extra;
  if (!extra || typeof extra !== "object") {
    return;
  }
  const values = (extra as { values?: SparseFieldValueMap<Tfieldname, string> })
    .values;
  if (!values || typeof values !== "object") {
    return;
  }
  return values;
};
