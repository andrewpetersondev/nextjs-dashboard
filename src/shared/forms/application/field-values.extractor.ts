import type { AppError } from "@/shared/errors/app-error";
import type { SparseFieldValueMap } from "@/shared/forms/domain/error-maps.types";

/**
 * Safely extract echoed field values from an AppError.
 * Returns undefined if not present.
 *
 * @example
 * const values = getFieldValues<'email' | 'username'>(AppError);
 * if (values?.email) {
 *   console.log(values.email); // string
 * }
 */
export const getFieldValues = <Tfieldname extends string>(
  error: AppError,
): SparseFieldValueMap<Tfieldname, string> | undefined => {
  const metadata = error?.metadata;
  if (!metadata || typeof metadata !== "object") {
    return;
  }
  const values = (
    metadata as { values?: SparseFieldValueMap<Tfieldname, string> }
  ).values;
  if (!values || typeof values !== "object") {
    return;
  }
  return values;
};
