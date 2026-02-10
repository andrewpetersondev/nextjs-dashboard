import type { FormErrors } from "@/shared/forms/core/types/field-error.types";

/**
 * An empty, frozen array of form errors.
 */
export const EMPTY_FORM_ERRORS: FormErrors = Object.freeze([]);

/**
 * Default human-readable messages for common form outcomes.
 */
export const FORM_MESSAGES = Object.freeze({
  failure: "There were errors with your submission.",
  success: "Action completed successfully.",
});
