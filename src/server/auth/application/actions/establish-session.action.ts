// src/server/auth/application/actions/establish-session.action.ts
"use server";
import type { SessionUser } from "@/features/auth/sessions/session-action.types";
import { setSessionToken } from "@/server/auth/domain/session/core/session";
import {
  type AuthLogLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging-auth/auth-layer-context";
import { AuthActionLogFactory } from "@/server/auth/logging-auth/auth-logging.contexts";
import { BaseError } from "@/shared/errors/core/base-error";
import { logger } from "@/shared/logging/infra/logger.shared";
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
): Promise<Result<SessionUser, BaseError>> {
  const actionContext: AuthLogLayerContext<"action"> =
    createAuthOperationContext({
      identifiers: { role: user.role, userId: user.id },
      layer: "action",
      operation: "login", // or a dedicated "establishSession" if you add it
    });

  const actionLogger = logger.withContext(actionContext.loggerContext);

  const res = await tryCatchAsync(
    async () => {
      await setSessionToken(user.id, user.role);
      return true as const;
    },
    (e: unknown): BaseError => BaseError.from(e),
  );

  const mapped: Result<SessionUser, BaseError> = res.ok
    ? Ok(user)
    : Err<BaseError>(res.error);

  if (mapped.ok) {
    actionLogger.operation("info", "Session established successfully", {
      ...AuthActionLogFactory.success(actionContext.operation, {
        role: user.role,
        userId: user.id,
      }),
      context: actionContext.loggerContext,
    });
  } else {
    const error = mapped.error;

    actionLogger.operation("error", "Failed to establish session", {
      ...AuthActionLogFactory.failure(actionContext.operation, {
        role: user.role,
        userId: user.id,
      }),
      context: actionContext.loggerContext,
      // Only rely on BaseError surface fields
      errorCode: error.code,
      errorMessage: error.message,
      ...(error.formErrors || error.fieldErrors
        ? {
            errorDetails: {
              ...(error.formErrors && { formErrors: error.formErrors }),
              ...(error.fieldErrors && { fieldErrors: error.fieldErrors }),
            },
          }
        : {}),
    });
  }

  return mapped;
}
