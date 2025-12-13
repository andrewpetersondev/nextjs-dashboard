import "server-only";

import type { SessionUser } from "@/modules/auth/domain/session/session-action.types";
import type { LoginData } from "@/modules/auth/domain/user/schema/auth.schema";
import type { AuthUserService } from "@/modules/auth/server/application/services/auth-user.service";
import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Orchestrates the login "story":
 * - authenticate user credentials
 * - establish a session for the authenticated user
 *
 * Expected failures are returned as Result values.
 * Unexpected failures should be handled by inner layers as AppError("unexpected") mapping.
 */
export async function loginWorkflow(
  input: Readonly<LoginData>,
  deps: Readonly<{
    authUserService: AuthUserService;
    sessionService: SessionService;
  }>,
): Promise<Result<SessionUser, AppError>> {
  const authResult = await deps.authUserService.login(input);

  if (!authResult.ok) {
    return Err(authResult.error);
  }

  const user: SessionUser = {
    id: authResult.value.id,
    role: authResult.value.role,
  };

  const sessionResult = await deps.sessionService.establish(user);

  if (!sessionResult.ok) {
    return Err(sessionResult.error);
  }

  return Ok(user);
}
