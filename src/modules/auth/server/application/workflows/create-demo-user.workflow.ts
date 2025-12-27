import "server-only";

import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { SessionPrincipalDto } from "@/modules/auth/server/application/types/dtos/session-principal.dto";
import type { CreateDemoUserUseCase } from "@/modules/auth/server/application/use-cases/user/create-demo-user.use-case";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the demo-user "story":
 * - create demo user (DB transaction)
 * - establish session (cookie/JWT, non-transactional)
 */
export async function createDemoUserWorkflow(
  role: UserRole,
  deps: Readonly<{
    createDemoUserUseCase: CreateDemoUserUseCase;
    sessionService: SessionService;
  }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  const demoResult = await deps.createDemoUserUseCase.execute(role);

  if (!demoResult.ok) {
    return Err(demoResult.error);
  }

  const user: SessionPrincipalDto = {
    id: demoResult.value.id,
    role: demoResult.value.role,
  };

  const sessionResult = await deps.sessionService.establish(user);

  if (!sessionResult.ok) {
    return Err(sessionResult.error);
  }

  return Ok(sessionResult.value);
}
