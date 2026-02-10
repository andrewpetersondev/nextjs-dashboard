import type {
  DenseFieldErrorMap,
  FormErrors,
} from "@/shared/forms/core/types/field-error.types";
import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";

/**
 * Loose shape matching a ZodError for flattening.
 */
export type ZodErrorLike = {
  readonly issues: readonly {
    readonly path: readonly (string | number | symbol)[];
    readonly message: string;
  }[];
};

/**
 * Combined form validation errors including field and form-level errors.
 *
 * @typeParam T - Field name literal union.
 * @typeParam M - Error message type.
 */
export type ValidationErrors<T extends string, M = string> = {
  readonly fieldErrors: DenseFieldErrorMap<T, M>;
  readonly formErrors: FormErrors;
};

/**
 * Metadata stored within an AppError specifically for form validation failures.
 *
 * @typeParam T - Field name literal union.
 */
export type FormValidationMetadata<T extends string> = ValidationErrors<
  T,
  string
> & {
  readonly formData: SparseFieldValueMap<T, string>;
};
