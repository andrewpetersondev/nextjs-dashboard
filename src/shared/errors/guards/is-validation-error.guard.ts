import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { AppError } from "@/shared/errors/core/app-error";

import type { ErrorMetadataValue } from "@/shared/errors/core/error-metadata.value";
import type {
  FieldErrors,
  FormErrors,
} from "@/shared/forms/types/field-error.value";

/**
 * Metadata shape for validation errors.
 *
 * @remarks
 * Validation errors commonly attach:
 * - `fieldErrors`: per-field messages (e.g. `{ email: ["required"] }`)
 * - `formErrors`: form-level messages (e.g. `["Please fix errors"]`)
 *
 * This intentionally reuses the canonical form error types from `shared/forms`
 * so error metadata and form infrastructure stay aligned.
 */
export interface ValidationErrorMetadata extends ErrorMetadataValue {
  readonly fieldErrors?: FieldErrors;
  readonly formErrors?: FormErrors;
}

/**
 * Type guard that narrows an unknown value to an `AppError` carrying
 * validation metadata compatible with the shared form types.
 *
 * @remarks
 * This checks:
 * - the value is an `AppError`
 * - the error code is the canonical `validation` code
 * - `metadata.fieldErrors` (when present) matches {@link FieldErrors}
 * - `metadata.formErrors` (when present) matches {@link FormErrors}
 *
 * Useful with `fromGuard` or similar helpers to turn generic errors into
 * strongly-typed validation failures that the forms layer can consume.
 */
export function isValidationError(
  error: unknown,
): error is AppError & { readonly metadata: ValidationErrorMetadata } {
  if (!(error instanceof AppError)) {
    return false;
  }

  if (error.code !== APP_ERROR_KEYS.validation) {
    return false;
  }

  const { metadata } = error;

  if (metadata === null || typeof metadata !== "object") {
    return false;
  }

  const metaRecord = metadata as Record<string, unknown>;
  const fieldErrors = metaRecord.fieldErrors;
  const formErrors = metaRecord.formErrors;

  const isStringArray = (value: unknown): value is readonly string[] =>
    Array.isArray(value) && value.every((item) => typeof item === "string");

  // Structural check for FieldErrors: Record<string, readonly string[]>
  if (
    fieldErrors !== undefined &&
    (fieldErrors === null ||
      typeof fieldErrors !== "object" ||
      !Object.values(fieldErrors as Record<string, unknown>).every(
        isStringArray,
      ))
  ) {
    return false;
  }

  // Structural check for FormErrors: readonly string[]
  if (formErrors !== undefined && !isStringArray(formErrors)) {
    return false;
  }

  return true;
}
