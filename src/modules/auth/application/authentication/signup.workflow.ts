import "server-only";
import type { SignupUseCase } from "@/modules/auth/application/authentication/signup.use-case";
import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { SignupRequestDto } from "@/modules/auth/application/schemas/signup-request.schema";
import { establishSessionForAuthUserWorkflow } from "@/modules/auth/application/session/establish-session-for-auth-user.workflow";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the signup "story" by coordinating user creation and session establishment.
 *
 * Workflow:
 * 1. Create a new user account (including password hashing and DB persistence).
 * 2. If user creation is successful, establish a new session (JWT/Cookies).
 *
 * @param input - The signup request data.
 * @param deps - Workflow dependencies (use cases and services).
 * @returns A Result containing the session principal or an AppError.
 */
export async function signupWorkflow(
  input: Readonly<SignupRequestDto>,
  deps: Readonly<{
    sessionService: SessionServiceContract;
    signupUseCase: SignupUseCase;
  }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  const signupResult = await deps.signupUseCase.execute(input);

  return await establishSessionForAuthUserWorkflow(signupResult, {
    sessionService: deps.sessionService,
  });
}
