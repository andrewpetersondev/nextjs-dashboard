import "server-only";

import type { AuthUserService } from "@/modules/auth/server/application/services/auth-user.service";
import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { SessionPrincipal } from "@/modules/auth/server/application/types/session-principal.types";
import type { LoginData } from "@/modules/auth/shared/domain/user/auth.schema";
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
): Promise<Result<SessionPrincipal, AppError>> {
  const authResult = await deps.authUserService.login(input);

  if (!authResult.ok) {
    return Err(authResult.error);
  }

  const user: SessionPrincipal = {
    id: authResult.value.id,
    role: authResult.value.role,
  };

  const sessionResult = await deps.sessionService.establish(user);

  if (!sessionResult.ok) {
    return Err(sessionResult.error);
  }

  return Ok(sessionResult.value);
}
