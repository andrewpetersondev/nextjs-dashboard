import "server-only";
import type { LoginRequestDto } from "@/modules/auth/application/authn/schemas/login-request.schema";
import type { LoginUseCase } from "@/modules/auth/application/authn/use-cases/login.use-case";
import type { SessionServiceContract } from "@/modules/auth/application/session/contracts/session-service.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/session/dtos/session-principal.dto";
import { establishSessionForAuthUserWorkflow } from "@/modules/auth/application/session/workflows/establish-session-for-auth-user.workflow";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the login "story" by coordinating authentication and session management.
 *
 * Workflow:
 * 1. Authenticate user credentials using the provided use case.
 * 2. If successful, establish a session for the authenticated user.
 *
 * This workflow maps specific authentication failures to a unified credential error
 * to protect against account enumeration.
 *
 * @param input - The login credentials.
 * @param deps - Workflow dependencies (use cases and services).
 * @returns A Result containing the session principal or an AppError.
 */
export async function loginWorkflow(
  input: Readonly<LoginRequestDto>,
  deps: Readonly<{
    loginUseCase: LoginUseCase;
    sessionService: SessionServiceContract;
  }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  const authResult = await deps.loginUseCase.execute(input);

  return await establishSessionForAuthUserWorkflow(authResult, {
    sessionService: deps.sessionService,
  });
}
