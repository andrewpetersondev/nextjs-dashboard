import type { ActionResult } from "@/shared/action-result/action-result";
import { ValidationError_New } from "@/shared/errors/domain";
import type { FieldErrors } from "@/shared/forms/types";
import type { Result } from "@/shared/result/result-base";

/**
 * Transforms a `Result` into an `ActionResult` with a standardized structure for handling success and validation errors.
 *
 * @typeParam T - The type of the `data` contained in the success case of the `Result`.
 * @param r - The `Result` object to transform. If the result is successful, its `data` will be included in the `ActionResult`.
 * @param okMessage - The message to include in the success case of the `ActionResult`. Defaults to `"OK"`.
 * @param errorMessage - The message to include in the error case of the `ActionResult`. Defaults to `"Invalid input"`.
 * @returns An `ActionResult` object:
 * - On success: Contains `data`, the provided or default success `message`, and `success: true`.
 * - On failure: Contains `errors` (derived from `ValidationError_New` field-specific errors if applicable, or a default root-level error), the provided or default failure `message`, and `success: false`.
 * @remarks
 * This utility is designed to encapsulate success or failure results into a consistent structure, converting validation errors into a usable format where possible.
 *
 * @example
 * ```typescript
 * const result: Result<string, unknown> = { success: true, data: "Valid Data" };
 * const actionResult = toActionValidationResult(result);
 * // ActionResult: { data: "Valid Data", message: "OK", success: true }
 * ```
 */
export const toActionValidationResult = <T>(
  r: Result<T, unknown>,
  okMessage = "OK",
  errorMessage = "Invalid input",
): ActionResult<T> => {
  if (r.success) {
    return { data: r.data, message: okMessage, success: true };
  }

  const err = r.error;
  let errors: FieldErrors;

  if (err instanceof ValidationError_New) {
    const fieldErrors = err.context?.fieldErrors as FieldErrors | undefined;
    errors =
      fieldErrors && Object.keys(fieldErrors).length > 0
        ? fieldErrors
        : { _root: [err.message] };
  } else {
    errors = { _root: [err instanceof Error ? err.message : String(err)] };
  }

  return { errors, message: errorMessage, success: false };
};
