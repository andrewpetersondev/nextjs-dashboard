import type { FieldErrors } from "@/shared/forms/types";

/**
 * --- Action Result Type ---
 * Standardized result for server actions.
 */
export type ActionResult<TData = unknown> =
  | {
      readonly success: true;
      readonly message: string;
      readonly data?: TData;
    }
  | {
      readonly success: false;
      readonly message: string;
      readonly errors: FieldErrors;
    };

/**
 * Constructs and returns an ActionResult object based on the provided parameters.
 *
 * Accepts either:
 * - Success shape: { success: true; message: string; data? }
 * - Failure shape: { success: false; message: string; errors? }
 *
 * On failure, if errors are omitted, a default _root message is populated
 * to avoid returning an empty errors map.
 */
export function actionResult<T>(
  params:
    | { success: true; message: string; data?: T }
    | { success: false; message: string; errors?: FieldErrors },
): ActionResult<T> {
  if (params.success) {
    const { message, data } = params;
    return {
      message,
      success: true,
      ...(data !== undefined ? { data } : {}),
    };
  }

  const { message } = params;
  const errors =
    params.errors && Object.keys(params.errors).length > 0
      ? params.errors
      : { _root: [message || "Operation failed"] };

  return {
    errors,
    message,
    success: false,
  };
}
