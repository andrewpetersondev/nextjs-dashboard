// src/lib/validation/action-result.adapter.ts
/**
 * Adapter to map validation Result into a boundary-friendly ActionResult.
 *
 * Documentation (conceptual, minimal code):
 * docs/lib/refactor-strategy/phase-1/1-3-validation-framework.md
 */
import type { Result } from "../result";
import { ValidationError } from "../domain.errors";

// Minimal local mirror of your app's ActionResult. Replace with your project's shared type in real code.
export type ActionResult<T> =
  | { success: true; message: string; errors: Record<string, string[]>; data: T }
  | { success: false; message: string; errors: Record<string, string[]> };

export const toActionValidationResult = <T>(
  r: Result<T, unknown>,
  okMessage = "OK",
  errorMessage = "Invalid input",
): ActionResult<T> =>
  r.success
    ? { success: true, message: okMessage, errors: {}, data: r.data }
    : {
        success: false,
        message: errorMessage,
        errors:
          r.error instanceof ValidationError &&
          (r.error as ValidationError).context?.fieldErrors
            ? ((r.error as ValidationError).context
                .fieldErrors as Record<string, string[]>)
            : {
                _root: [
                  r.error instanceof Error ? r.error.message : String(r.error),
                ],
              },
      };
