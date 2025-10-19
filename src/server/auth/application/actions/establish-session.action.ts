"use server";
import { toUnexpectedAuthError } from "@/server/auth/domain/errors/auth-error.factories";
import type { SessionUser } from "@/server/auth/domain/types/session-action.types";
import { setSessionToken } from "@/server/auth/session/session";
import { LOGGER_CONTEXT_SESSION } from "@/server/auth/session/session.constants";
import { serverLogger } from "@/server/logging/serverLogger";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { tryCatchAsync } from "@/shared/core/result/async/result-async";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Establishes a session for a user by setting `jwt cookie`.
 *
 * @param u - The user object containing `id` and `role`.
 *
 * @returns A promise that resolves to a Result indicating the success or failure of the session establishment.
 */
export async function establishSessionAction(
  u: SessionUser,
): Promise<Result<true, AppError>> {
  const res = await tryCatchAsync(
    async () => {
      await setSessionToken(u.id, u.role);
      return true as const;
    },
    {
      mapError: toUnexpectedAuthError,
    },
  );

  const mapped: Result<true, AppError> = res.ok
    ? Ok<true>(true as const)
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
