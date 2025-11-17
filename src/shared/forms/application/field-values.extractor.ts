import type { BaseError } from "@/shared/errors/base-error";
import type { SparseFieldValueMap } from "@/shared/forms/domain/error-maps.types";

/**
 * Safely extract echoed field values from an BaseError.
 * Returns undefined if not present.
 *
 * @example
 * const values = getFieldValues<'email' | 'username'>(BaseError);
 * if (values?.email) {
 *   console.log(values.email); // string
 * }
 */
export const getFieldValues = <Tfieldname extends string>(
  error: BaseError,
): SparseFieldValueMap<Tfieldname, string> | undefined => {
  const extra = error?.fieldErrors;
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
