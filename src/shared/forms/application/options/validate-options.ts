import { FORM_ERROR_MESSAGES } from "@/shared/forms/constants/messages";

const DEFAULT_LOGGER_CONTEXT = "validateForm" as const;
const DEFAULT_FAILURE_MESSAGE = FORM_ERROR_MESSAGES.validationFailed;

/**
 * Options for form validation operations.
 *
 * @typeParam Tin - Type of input object being validated.
 * @typeParam Tfieldnames - String literal union of field names in Tin.
 */
export interface ValidateOptions<Tin, Tfieldnames extends keyof Tin & string> {
  readonly fields?: readonly Tfieldnames[];
  readonly raw?: Readonly<Partial<Record<Tfieldnames, unknown>>>;
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
  Tin,
  Tfieldnames extends keyof Tin & string,
>(options: ValidateOptions<Tin, Tfieldnames>) {
  return {
    failureMessage: options.messages?.failureMessage ?? DEFAULT_FAILURE_MESSAGE,
    fields: options.fields,
    loggerContext: options.loggerContext ?? DEFAULT_LOGGER_CONTEXT,
    raw: options.raw,
    successMessage: options.messages?.successMessage ?? "",
  };
}
