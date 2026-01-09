import "server-only";

import type { SessionAdapterContract } from "@/modules/auth/application/contracts/session-adapter.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { establishSessionForAuthUserWorkflow } from "@/modules/auth/application/use-cases/establish-session-for-auth-user.workflow";
import type { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case";
import type { AuthLoginSchemaDto } from "@/modules/auth/domain/schemas/auth-user.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the login "story":
 * - authenticate user credentials
 * - establish a session for the authenticated user
 *
 * Maps specific authentication failures to a unified credential error
 * to protect against account enumeration.
 */
export async function loginWorkflow(
  input: Readonly<AuthLoginSchemaDto>,
  deps: Readonly<{
    loginUseCase: LoginUseCase;
    sessionService: SessionAdapterContract;
  }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  const authResult = await deps.loginUseCase.execute(input);

  return await establishSessionForAuthUserWorkflow(authResult, {
    sessionService: deps.sessionService,
  });
}
