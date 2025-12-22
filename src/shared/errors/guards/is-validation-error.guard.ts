import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { AppError } from "@/shared/errors/core/app-error";
import type { ErrorMetadata } from "@/shared/errors/core/app-error.types";

/**
 * Metadata shape for validation errors.
 *
 * @remarks
 * Validation errors commonly attach:
 * - `fieldErrors`: per-field messages (e.g. `{ email: ["required"] }`)
 * - `formErrors`: form-level messages (e.g. `["Please fix errors"]`)
 */
export interface ValidationErrorMetadata extends ErrorMetadata {
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly formErrors?: readonly string[];
}

/**
 * Type guard that narrows an unknown value to an `AppError` carrying
 * validation metadata.
 *
 * @remarks
 * This checks:
 * - the value is an `AppError`
 * - the error code is the canonical `validation` code
 * - `metadata.fieldErrors` (when present) is a map of string → string[]
 * - `metadata.formErrors` (when present) is a string[]
 *
 * Useful with `fromGuard` or similar helpers to turn generic errors into
 * strongly-typed validation failures.
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

  if (formErrors !== undefined && !isStringArray(formErrors)) {
    return false;
  }

  return true;
}
