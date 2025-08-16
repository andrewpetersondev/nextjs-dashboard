import "server-only";

import type { Result } from "@/lib/core/result";
import { ValidationError_New } from "@/lib/errors/domain.error";
import type { ActionResult, FieldErrors } from "@/lib/types/action-result";

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
