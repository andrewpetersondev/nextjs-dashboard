import { FORM_ERROR_MESSAGES } from "@/shared/forms/constants/messages";

const DEFAULT_LOGGER_CONTEXT = "validateForm" as const;
const DEFAULT_FAILURE_MESSAGE = FORM_ERROR_MESSAGES.validationFailed;

/**
 * Options for form validation operations.
 *
 * @typeParam TIn - Type of input object being validated.
 * @typeParam TFieldNames - String literal union of field names in TIn.
 */
export interface ValidateOptions<TIn, TFieldNames extends keyof TIn & string> {
  readonly fields?: readonly TFieldNames[];
  readonly raw?: Readonly<Partial<Record<TFieldNames, unknown>>>;
  readonly loggerContext?: string;
  readonly messages?: {
    readonly successMessage?: string;
    readonly failureMessage?: string;
  };
}

/**
 * Resolves validation options with defaults.
 */
export function resolveValidateOptions<
  TIn,
  TFieldNames extends keyof TIn & string,
>(options: ValidateOptions<TIn, TFieldNames>) {
  return {
    failureMessage: options.messages?.failureMessage ?? DEFAULT_FAILURE_MESSAGE,
    fields: options.fields,
    loggerContext: options.loggerContext ?? DEFAULT_LOGGER_CONTEXT,
    raw: options.raw,
    successMessage: options.messages?.successMessage ?? "",
  };
}
