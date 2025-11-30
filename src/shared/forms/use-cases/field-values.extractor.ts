import type { AppError } from "@/shared/errors/core/app-error.class";
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
export const getFieldValues = <T extends string>(
  error: AppError,
): SparseFieldValueMap<T, string> | undefined => {
  const metadata = error?.metadata;
  if (!metadata || typeof metadata !== "object") {
    return;
  }
  const values = (metadata as { values?: SparseFieldValueMap<T, string> })
    .values;
  if (!values || typeof values !== "object") {
    return;
  }
  return values;
};
