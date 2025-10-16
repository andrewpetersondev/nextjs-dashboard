"use server";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { toUnexpectedAuthServiceError } from "@/server/auth/application/mapping/auth-service-error.to-app-error";
import type { AuthActionError } from "@/server/auth/domain/errors/auth-service.error";
import type { EstablishSessionInput } from "@/server/auth/domain/types/session-action.types";
import { setSessionToken } from "@/server/auth/session/session";
import { LOGGER_CONTEXT_SESSION } from "@/server/auth/session/session.constants";
import { serverLogger } from "@/server/logging/serverLogger";
import { tryCatchAsync } from "@/shared/core/result/async/result-async";
import { Err, Ok, type Result } from "@/shared/core/result/result";
import { toUserId } from "@/shared/domain/id-converters";

/**
 * Establishes a session for a user by setting `jwt cookie`.
 *
 * @param u - The user object containing `id` and `role`.
 *
 * @returns A promise that resolves to a Result indicating the success or failure of the session establishment.
 */
export async function establishSessionAction(
  u: EstablishSessionInput,
): Promise<Result<true, AuthActionError>> {
  const res = await tryCatchAsync(
    async () => {
      await setSessionToken(toUserId(u.id), toUserRole(u.role));
      return true as const;
    },
    {
      mapError: toUnexpectedAuthServiceError,
    },
  );

  const mapped: Result<true, AuthActionError> = res.ok
    ? Ok<true>(true as const)
    : Err<AuthActionError>(toUnexpectedAuthServiceError(res.error));

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
