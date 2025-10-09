// File: establish-session.ts
// Purpose: side-effect to establish an authenticated session after signup/login.
"use server";

import { toUserRole } from "@/features/users/lib/to-user-role";
import { LOGGER_CONTEXT_SESSION } from "@/server/auth/constants";
import { mapErrorToAuthServiceUnexpected } from "@/server/auth/mappers/auth-errors.mapper";
import { setSessionToken } from "@/server/auth/session";
import type { EstablishSessionInput } from "@/server/auth/types/session-action.types";
import type { AuthServiceError } from "@/server/auth/user-auth.service";
import { serverLogger } from "@/server/logging/serverLogger";
import { tryCatchAsync } from "@/shared/core/result/async/result-async";
import { Err, Ok, type Result } from "@/shared/core/result/result";
import { toUserId } from "@/shared/domain/id-converters";

export async function establishSession(
  u: EstablishSessionInput,
): Promise<Result<true, AuthServiceError>> {
  const r = await tryCatchAsync(async () => {
    await setSessionToken(toUserId(u.id), toUserRole(u.role));
    return true as const;
  });

  const mapped: Result<true, AuthServiceError> = r.ok
    ? Ok<true, AuthServiceError>(true as const)
    : Err<never, AuthServiceError>(
        mapErrorToAuthServiceUnexpected({
          message: r.error?.message ?? "Failed to establish session",
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
  return mapped;
}
