// src/server/auth/application/actions/establish-session.action.ts
"use server";
import type { SessionUser } from "@/features/auth/sessions/session-action.types";
import { toUnexpectedAppError } from "@/server/auth/domain/errors/app-error.factories";
import { setSessionToken } from "@/server/auth/domain/session/core/session";
import {
  type AuthLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging/auth-layer-context";
import { AuthActionLogFactory } from "@/server/auth/logging/auth-logging.contexts";
import { logger } from "@/shared/logging/logger.shared";
import type { AppError } from "@/shared/result/app-error/app-error";
import { tryCatchAsync } from "@/shared/result/async/result-async";
import { Err, Ok, type Result } from "@/shared/result/result";

/**
 * Establishes a session for a user by setting `jwt cookie`.
 *
 * @param user - The user object containing `id` and `role`.
 *
 * @returns A promise that resolves to a Result indicating the success or failure of the session establishment.
 */
export async function establishSessionAction(
  user: SessionUser,
): Promise<Result<SessionUser, AppError>> {
  const actionContext: AuthLayerContext<"action"> = createAuthOperationContext({
    identifiers: { role: user.role, userId: user.id },
    layer: "action",
    operation: "login", // or a dedicated "establishSession" if you add it
  });

  const actionLogger = logger.withContext(actionContext.context);

  const res = await tryCatchAsync(async () => {
    await setSessionToken(user.id, user.role);
    return true as const;
  }, toUnexpectedAppError);

  const mapped: Result<SessionUser, AppError> = res.ok
    ? Ok(user)
    : Err<AppError>(res.error);

  if (mapped.ok) {
    actionLogger.operation("info", "Session established successfully", {
      ...AuthActionLogFactory.success(actionContext.operation, {
        role: user.role,
        userId: user.id,
      }),
      context: actionContext.context,
    });
  } else {
    const error = mapped.error;

    actionLogger.operation("error", "Failed to establish session", {
      ...AuthActionLogFactory.failure(actionContext.operation, {
        role: user.role,
        userId: user.id,
      }),
      context: actionContext.context,
      // Only rely on AppError surface fields
      errorCode: error.code,
      errorMessage: error.message,
      ...(error.details && { errorDetails: error.details }),
    });
  }

  return mapped;
}
