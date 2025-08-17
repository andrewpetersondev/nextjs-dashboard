import "server-only";

import type { Result } from "@/lib/core/result.base";
import { ValidationError_New } from "@/lib/errors/error.domain";
import type { ActionResult, FieldErrors } from "@/lib/types/action-result";

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
): ActionResult<T> =>
  r.success
    ? { data: r.data, message: okMessage, success: true }
    : {
        errors:
          r.error instanceof ValidationError_New &&
          (r.error as ValidationError_New).context?.fieldErrors
            ? ((r.error as ValidationError_New).context
                .fieldErrors as FieldErrors)
            : {
                _root: [
                  r.error instanceof Error ? r.error.message : String(r.error),
                ],
              },
        message: errorMessage,
        success: false,
      };
