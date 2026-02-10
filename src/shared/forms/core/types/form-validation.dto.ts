import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";

/**
 * Input options for form validation.
 *
 * @typeParam T - The shape of the object being validated.
 * @typeParam K - A string literal union of keys from `T` representing field names.
 */
export interface FormValidationOptions<T, K extends keyof T & string> {
  readonly fields?: readonly K[];
  readonly loggerContext?: string;
  readonly messages?: {
    readonly failureMessage?: string;
    readonly successMessage?: string;
  };
  readonly raw?: SparseFieldValueMap<K, unknown>;
}
