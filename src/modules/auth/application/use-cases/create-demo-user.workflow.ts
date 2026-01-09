import "server-only";

import type { SessionAdapterContract } from "@/modules/auth/application/contracts/session-adapter.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { CreateDemoUserUseCase } from "@/modules/auth/application/use-cases/create-demo-user.use-case";
import { establishSessionForAuthUserWorkflow } from "@/modules/auth/application/use-cases/establish-session-for-auth-user.workflow";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the creation of a demo user and session.
 */
export async function createDemoUserWorkflow(
  role: UserRole,
  deps: Readonly<{
    createDemoUserUseCase: CreateDemoUserUseCase;
    sessionService: SessionAdapterContract;
  }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  const userResult = await deps.createDemoUserUseCase.execute(role);

  return await establishSessionForAuthUserWorkflow(userResult, {
    sessionService: deps.sessionService,
  });
}
