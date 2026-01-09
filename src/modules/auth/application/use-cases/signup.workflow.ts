import "server-only";

import type { SessionAdapterContract } from "@/modules/auth/application/contracts/session-adapter.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { establishSessionForAuthUserWorkflow } from "@/modules/auth/application/use-cases/establish-session-for-auth-user.workflow";
import type { SignupUseCase } from "@/modules/auth/application/use-cases/signup.use-case";
import type { AuthSignupSchemaDto } from "@/modules/auth/domain/schemas/auth-user.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the signup "story":
 * - create user (DB transaction)
 * - establish session (cookie/JWT, non-transactional)
 */
export async function signupWorkflow(
  input: Readonly<AuthSignupSchemaDto>,
  deps: Readonly<{
    sessionService: SessionAdapterContract;
    signupUseCase: SignupUseCase;
  }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  const signupResult = await deps.signupUseCase.execute(input);

  return await establishSessionForAuthUserWorkflow(signupResult, {
    sessionService: deps.sessionService,
  });
}
