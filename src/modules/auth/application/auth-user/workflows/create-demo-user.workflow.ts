import "server-only";
import type { CreateDemoUserUseCase } from "@/modules/auth/application/auth-user/use-cases/create-demo-user.use-case";
import type { SessionServiceContract } from "@/modules/auth/application/session/contracts/session-service.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/session/dtos/session-principal.dto";
import { establishSessionForAuthUserWorkflow } from "@/modules/auth/application/session/workflows/establish-session-for-auth-user.workflow";
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
