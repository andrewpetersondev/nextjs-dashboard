import type {
  FormValidationOptions,
  FormValidationParams,
} from "@/shared/forms/types/form-validation.dto";

const DEFAULT_LOGGER_CONTEXT = "validateForm" as const;

/**
 * Resolve validation options by applying defaults for missing values.
 *
 * @typeParam T - The input object type being validated.
 * @typeParam K - A string literal union of keys from `T`.
 * @param options - Validation options to resolve.
 * @returns An object containing resolved validation parameters.
 */
export function resolveFormValidationOptions<T, K extends keyof T & string>(
  options: FormValidationOptions<T, K>,
): FormValidationParams<K> {
  return {
    failureMessage: options.messages?.failureMessage ?? "i hate defaults",
    fields: options.fields,
    loggerContext: options.loggerContext ?? DEFAULT_LOGGER_CONTEXT,
    raw: options.raw,
    successMessage: options.messages?.successMessage ?? "",
  };
}
