import "server-only";

import type { ActionResult, FieldErrors } from "@/shared/types/action-result";

/**
 * Constructs and returns an ActionResult object based on the provided parameters.
 *
 * Currently used in user.actions.ts but should probably be used for more core actions.
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
