import "server-only";
import { ERROR_CODES } from "@/shared/core/errors/base/error-codes";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { makeAppErrorDetails } from "@/shared/core/result/app-error/app-error";

/**
 * Normalize domain AppErrors into form-aware errors.
 * Enriches errors with fieldErrors based on ERROR_CODES metadata.
 *
 * @remarks
 * - If the error already has fieldErrors, returns it as-is
 * - If the error code has authFields metadata, maps to those fields
 * - Falls back to form-level error (empty fieldErrors) for codes without field mappings
 *
 * @typeParam TField - The union of form field names
 * @param error - The AppError to normalize
 * @param params - Configuration including fields list
 * @returns Form-aware AppError with fieldErrors in details
 *
 * @example
 * ```typescript
 * const error = appErrorFromCode("UNAUTHORIZED", "Invalid email or password");
 * const formError = toFormAwareError(error, {
 *   fields: ["email", "password"] as const,
 * });
 * // formError.details.fieldErrors = { email: ["Invalid email or password"], password: ["Invalid email or password"] }
 * ```
 */
export function toFormAwareError<TField extends string>(
  error: AppError,
  params: {
    readonly fields: readonly TField[];
  },
): AppError {
  const { fields } = params;

  // If already form-aware (has fieldErrors), return as-is
  if (error.details?.fieldErrors) {
    return error;
  }

  // Get metadata for this error code
  const codeMeta = ERROR_CODES[error.code];

  if (!(codeMeta && "authFields" in codeMeta)) {
    // No field mapping for this code - return empty fieldErrors
    return {
      ...error,
      details: makeAppErrorDetails({
        fieldErrors: Object.freeze(
          Object.fromEntries(fields.map((f) => [f, []])),
        ) as Readonly<Record<string, readonly string[]>>,
      }),
    };
  }

  // Map error to relevant fields from authFields metadata
  const targetFields = (codeMeta.authFields as readonly string[]).filter((f) =>
    (fields as readonly string[]).includes(f),
  );

  if (targetFields.length === 0) {
    // No matching fields - return empty fieldErrors
    return {
      ...error,
      details: makeAppErrorDetails({
        fieldErrors: Object.freeze(
          Object.fromEntries(fields.map((f) => [f, []])),
        ) as Readonly<Record<string, readonly string[]>>,
      }),
    };
  }

  // Populate fieldErrors for matching fields
  const fieldErrors = Object.freeze(
    Object.fromEntries([
      ...fields.map((f) => [
        f,
        targetFields.includes(f) ? [error.message] : [],
      ]),
    ]),
  ) as Readonly<Record<string, readonly string[]>>;

  return {
    ...error,
    details: makeAppErrorDetails({
      fieldErrors,
    }),
  };
}
