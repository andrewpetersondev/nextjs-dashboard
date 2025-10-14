// File: establish-session.action.ts
// Purpose: side-effect to establish an authenticated session after signup/login.
"use server";

import { toUserRole } from "@/features/users/lib/to-user-role";
import { mapToUnexpectedAuthServiceError } from "@/server/auth/mappers/auth-service-errors.mappers";
import type { AuthServiceError } from "@/server/auth/service/auth-errors";
import { LOGGER_CONTEXT_SESSION } from "@/server/auth/session/constants";
import { setSessionToken } from "@/server/auth/session/session";
import type { EstablishSessionInput } from "@/server/auth/types/session-action.types";
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
): Promise<Result<true, AuthServiceError>> {
  // sets the session token in local storage
  // returns Result<true, AuthServiceError>
  const res = await tryCatchAsync(
    async () => {
      await setSessionToken(toUserId(u.id), toUserRole(u.role));
      return true as const;
    },
    {
      mapError: (e) =>
        mapToUnexpectedAuthServiceError({
          message: e instanceof Error ? e.message : "Session token error",
        }),
    },
  );

  // normalize/build/construct res
  // success path => create successful result => Ok<true>
  // error path => create failed result => Err<AuthServiceError>
  const mapped: Result<true, AuthServiceError> = res.ok
    ? Ok<true>(true as const)
    : Err<AuthServiceError>(
        mapToUnexpectedAuthServiceError({
          message: res.error?.message ?? "Failed to establish session",
        }),
      );

  if (!mapped.ok) {
    serverLogger.error(
      {
        context: LOGGER_CONTEXT_SESSION,
        error: { message: mapped.error.message, name: "AuthSessionError" },
      },
      "Failed to establish session",
    );
  }

  // single return point for all paths
  return mapped;
}
