import { FORM_ERROR_MESSAGES } from "@/shared/forms/shared/form-messages.constants";
import type { FormValidationOptions } from "@/shared/forms/types/form-validation.dto";

const DEFAULT_LOGGER_CONTEXT = "validateForm" as const;
const DEFAULT_FAILURE_MESSAGE = FORM_ERROR_MESSAGES.validationFailed;

/**
 * Resolve validation options by applying defaults for missing values.
 *
 * @typeParam T - The input object type being validated.
 * @typeParam K - A string literal union of keys from `T`.
 * @param options - Validation options to resolve.
 * @returns An object containing resolved `failureMessage`, `successMessage`, `loggerContext`, `fields`, and `raw`.
 */
export function resolveFormValidationOptions<T, K extends keyof T & string>(
  options: FormValidationOptions<T, K>,
) {
  return {
    failureMessage: options.messages?.failureMessage ?? DEFAULT_FAILURE_MESSAGE,
    fields: options.fields,
    loggerContext: options.loggerContext ?? DEFAULT_LOGGER_CONTEXT,
    raw: options.raw,
    successMessage: options.messages?.successMessage ?? "",
  };
}
