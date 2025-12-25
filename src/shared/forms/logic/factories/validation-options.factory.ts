import type {
  FormValidationOptions,
  FormValidationParams,
} from "@/shared/forms/core/types/form-validation.dto";

/**
 * Resolve validation options by applying defaults for missing values.
 *
 * @deprecated Use explicit parameters. Moving towards strict data integrity.
 */
export function resolveFormValidationOptions<T, K extends keyof T & string>(
  options: FormValidationOptions<T, K>,
): FormValidationParams<K> {
  return {
    failureMessage: options.messages?.failureMessage ?? "",
    fields: options.fields,
    loggerContext: options.loggerContext ?? "FormValidation",
    raw: options.raw,
    successMessage: options.messages?.successMessage ?? "",
  };
}
