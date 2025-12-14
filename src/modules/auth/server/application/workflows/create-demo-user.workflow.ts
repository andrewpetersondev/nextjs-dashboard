import "server-only";

import type { UserRole } from "@/modules/auth/domain/user/auth.roles";
import type { AuthUserService } from "@/modules/auth/server/application/services/auth-user.service";
import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { SessionPrincipal } from "@/modules/auth/server/application/types/session-principal.types";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Orchestrates the demo-user "story":
 * - create demo user (role-based)
 * - establish session
 */
export async function createDemoUserWorkflow(
  role: UserRole,
  deps: Readonly<{
    authUserService: AuthUserService;
    sessionService: SessionService;
  }>,
): Promise<Result<SessionPrincipal, AppError>> {
  const demoResult = await deps.authUserService.createDemoUser(role);

  if (!demoResult.ok) {
    return Err(demoResult.error);
  }

  const user: SessionPrincipal = {
    id: demoResult.value.id,
    role: demoResult.value.role,
  };

  const sessionResult = await deps.sessionService.establish(user);

  if (!sessionResult.ok) {
    return Err(sessionResult.error);
  }

  return Ok(user);
}
