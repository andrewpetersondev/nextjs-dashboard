import "server-only";
import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { CreateDemoUserUseCase } from "@/modules/auth/application/use-cases/demo/create-demo-user.use-case";
import { establishSessionForAuthUserWorkflow } from "@/modules/auth/application/use-cases/session/establish-session-for-auth-user.workflow";
import type { UserRole } from "@/shared/domain/user/user-role.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the creation of a demo user and session.
 */
export async function createDemoUserWorkflow(
  role: UserRole,
  deps: Readonly<{
    demoUserUseCase: CreateDemoUserUseCase;
    sessionService: SessionServiceContract;
  }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  const userResult = await deps.demoUserUseCase.execute(role);

  return await establishSessionForAuthUserWorkflow(userResult, {
    sessionService: deps.sessionService,
  });
}
