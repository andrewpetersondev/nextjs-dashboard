"use server";
import { LOGGER_CONTEXT_SESSION } from "@/server/auth/domain/constants/session.constants";
import { toUnexpectedAppError } from "@/server/auth/domain/errors/app-error.factories";
import { setSessionToken } from "@/server/auth/domain/session/core/session";
import type { SessionUser } from "@/server/auth/domain/types/session-action.types";
import { serverLogger } from "@/server/logging/serverLogger";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { tryCatchAsync } from "@/shared/core/result/async/result-async";
import { Err, Ok, type Result } from "@/shared/core/result/result";

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
  const res = await tryCatchAsync(async () => {
    await setSessionToken(user.id, user.role);
    return true as const;
  }, toUnexpectedAppError);

  const mapped: Result<SessionUser, AppError> = res.ok
    ? Ok(user)
    : Err<AppError>(res.error);

  if (!mapped.ok) {
    serverLogger.error(
      {
        context: LOGGER_CONTEXT_SESSION,
        error: { message: mapped.error.message, name: "AuthSessionError" },
      },
      "Failed to establish session",
    );
  }

  return mapped;
}
