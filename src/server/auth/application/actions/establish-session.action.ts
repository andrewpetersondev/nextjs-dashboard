// src/server/auth/application/actions/establish-session.action.ts
"use server";
import type { SessionUser } from "@/features/auth/sessions/session-action.types";
import { setSessionToken } from "@/server/auth/domain/session/core/session";
import { AuthLog, logAuth } from "@/server/auth/logging-auth/auth-log";
import { BaseError } from "@/shared/errors/core/base-error";
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
  const requestId = crypto.randomUUID();

  // Start (optional start event)
  logAuth("info", "Establish session start", AuthLog.action.login.start(), {
    additionalData: { role: user.role, userId: user.id },
    requestId,
  });

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
    logAuth(
      "info",
      "Session established successfully",
      AuthLog.action.login.success({ role: user.role, userId: user.id }),
      { requestId },
    );
  } else {
    const error = mapped.error;
    logAuth(
      "error",
      "Failed to establish session",
      AuthLog.action.login.error(error, { role: user.role, userId: user.id }),
      { requestId },
    );
  }

  return mapped;
}
