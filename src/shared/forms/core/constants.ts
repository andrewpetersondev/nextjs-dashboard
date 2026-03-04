import type { FormErrors } from "@/shared/forms/core/types/field-error.types";

/**
 * Default human-readable messages for common form outcomes.
 */
type FormMessages = Readonly<{
	failure: string;
	success: string;
}>;

/**
 * An empty, frozen array of form errors.
 */
export const EMPTY_FORM_ERRORS: FormErrors = Object.freeze([]);

export const FORM_MESSAGES: FormMessages = Object.freeze({
	failure: "There were errors with your submission.",
	success: "Action completed successfully.",
});
