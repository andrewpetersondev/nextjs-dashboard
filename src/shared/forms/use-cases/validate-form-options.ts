import { FORM_ERROR_MESSAGES } from "@/shared/forms/domain/constants/form-messages.constants";

const DEFAULT_LOGGER_CONTEXT = "validateForm" as const;
const DEFAULT_FAILURE_MESSAGE = FORM_ERROR_MESSAGES.validationFailed;

/**
 * Options controlling form validation behavior.
 *
 * @typeParam T - The shape of the object being validated.
 * @typeParam K - A string literal union of keys from `T` representing field names.
 */
export interface ValidateFormOptions<T, K extends keyof T & string> {
  /**
   * Specific fields to validate. When omitted, callers may validate all applicable fields.
   */
  readonly fields?: readonly K[];

  /**
   * Raw input values (often unvalidated/unparsed) keyed by field name.
   * Use when validation needs access to original input (e.g. for type coercion or error context).
   */
  readonly raw?: Readonly<Partial<Record<K, unknown>>>;

  /**
   * Context string used for logging/tracing. Defaults to `DEFAULT_LOGGER_CONTEXT`.
   */
  readonly loggerContext?: string;

  /**
   * Optional custom messages for the validation operation.
   */
  readonly messages?: {
    /**
     * Message to use when validation succeeds. Defaults to an empty string.
     */
    readonly successMessage?: string;

    /**
     * Message to use when validation fails. Defaults to `DEFAULT_FAILURE_MESSAGE`.
     */
    readonly failureMessage?: string;
  };
}

/**
 * Resolve validation options by applying defaults for missing values.
 *
 * @typeParam T - The input object type being validated.
 * @typeParam K - A string literal union of keys from `T`.
 * @param options - Validation options to resolve.
 * @returns An object containing resolved `failureMessage`, `successMessage`, `loggerContext`, `fields`, and `raw`.
 */
export function resolveValidateOptions<T, K extends keyof T & string>(
  options: ValidateFormOptions<T, K>,
) {
  return {
    failureMessage: options.messages?.failureMessage ?? DEFAULT_FAILURE_MESSAGE,
    fields: options.fields,
    loggerContext: options.loggerContext ?? DEFAULT_LOGGER_CONTEXT,
    raw: options.raw,
    successMessage: options.messages?.successMessage ?? "",
  };
}
