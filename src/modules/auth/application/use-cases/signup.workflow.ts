import "server-only";

import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import { establishSessionForAuthUserWorkflow } from "@/modules/auth/application/use-cases/establish-session-for-auth-user.workflow";
import type { SignupUseCase } from "@/modules/auth/application/use-cases/signup.use-case";
import type { AuthSignupSchemaDto } from "@/modules/auth/domain/schemas/auth-user.schema";
import type { SessionIdentityDto } from "@/modules/auth/domain/types/session-identity.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the signup "story":
 * - create user (DB transaction)
 * - establish session (cookie/JWT, non-transactional)
 */
export async function signupWorkflow(
  input: Readonly<SignupRequestDto>,
  deps: Readonly<{
    sessionService: SessionServiceContract;
    signupUseCase: SignupUseCase;
  }>,
): Promise<Result<SessionIdentityDto, AppError>> {
  const signupResult = await deps.signupUseCase.execute(input);

  return await establishSessionForAuthUserWorkflow(signupResult, {
    sessionService: deps.sessionService,
  });
}
