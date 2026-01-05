import "server-only";

import type { SessionAdapterContract } from "@/modules/auth/application/contracts/session-adapter.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { CreateDemoUserCommand } from "@/modules/auth/application/use-cases/commands/create-demo-user.command";
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
    createDemoUserUseCase: CreateDemoUserCommand;
    sessionService: SessionAdapterContract;
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
