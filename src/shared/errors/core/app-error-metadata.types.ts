import type {
  FieldErrors,
  FormErrors,
} from "@/shared/forms/types/field-error.value";

/**
 * Form-specific error metadata structure.
 */
export interface FormErrorMetadata extends Record<string, unknown> {
  readonly fieldErrors?: FieldErrors;
  readonly formErrors?: FormErrors;
  /** Optional: submitted form values for debugging */
  readonly values?: Readonly<Record<string, unknown>>;
}

/**
 * Database-specific error metadata structure.
 */
export interface DatabaseErrorMetadata extends Record<string, unknown> {
  readonly column?: string;
  readonly constraint?: string;
  readonly entity?: string;
  readonly operation?: string;
  readonly pgCode?: string;
  readonly table?: string;
}
