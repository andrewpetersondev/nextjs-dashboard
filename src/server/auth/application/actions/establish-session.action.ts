// src/server/auth/application/actions/establish-session.action.ts
"use server";
import { AuthLog, logAuth } from "@/features/auth/domain/logging/auth-log";
import type { SessionUser } from "@/features/auth/domain/sessions/session-action.types";
import { createSessionManager } from "@/server/auth/application/services/factories/session-manager.factory";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

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
  const requestId = crypto.randomUUID();

  // Start (optional start event)
  logAuth("info", "Establish session start", AuthLog.action.login.start(), {
    additionalData: { role: user.role, userId: user.id },
    requestId,
  });

  const sessionManager = createSessionManager();

  const res = await sessionManager.establish(user);

  if (res.ok) {
    logAuth(
      "info",
      "Session established successfully",
      AuthLog.action.login.success({ role: user.role, userId: user.id }),
      { requestId },
    );
    return Ok(user);
  }

  const error = res.error;
  logAuth(
    "error",
    "Failed to establish session",
    AuthLog.action.login.error(error, { role: user.role, userId: user.id }),
    { requestId },
  );
  return Err<AppError>(error);
}
