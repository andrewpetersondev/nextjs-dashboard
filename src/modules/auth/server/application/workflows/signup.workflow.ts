import "server-only";

import type { AuthUserService } from "@/modules/auth/server/application/services/auth-user.service";
import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { SessionPrincipal } from "@/modules/auth/server/application/types/session-principal.types";
import type { SignupData } from "@/modules/auth/shared/domain/user/auth.schema";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Orchestrates the signup "story":
 * - create user
 * - establish session
 */
export async function signupWorkflow(
  input: Readonly<SignupData>,
  deps: Readonly<{
    authUserService: AuthUserService;
    sessionService: SessionService;
  }>,
): Promise<Result<SessionPrincipal, AppError>> {
  const signupResult = await deps.authUserService.signup(input);

  if (!signupResult.ok) {
    return Err(signupResult.error);
  }

  const user: SessionPrincipal = {
    id: signupResult.value.id,
    role: signupResult.value.role,
  };

  const sessionResult = await deps.sessionService.establish(user);

  if (!sessionResult.ok) {
    return Err(sessionResult.error);
  }

  return Ok(sessionResult.value);
}
