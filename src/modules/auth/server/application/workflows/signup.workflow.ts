import "server-only";

import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { SessionPrincipalDto } from "@/modules/auth/server/application/types/dtos/session-principal.dto";
import type { SignupUseCase } from "@/modules/auth/server/application/use-cases/user/signup.use-case";
import type { AuthSignupSchemaDto } from "@/modules/auth/shared/domain/user/auth-user.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the signup "story":
 * - create user (DB transaction)
 * - establish session (cookie/JWT, non-transactional)
 */
export async function signupWorkflow(
  input: Readonly<AuthSignupSchemaDto>,
  deps: Readonly<{
    createUserUseCase: SignupUseCase;
    sessionService: SessionService;
  }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  const signupResult = await deps.createUserUseCase.execute(input);

  if (!signupResult.ok) {
    return Err(signupResult.error);
  }

  const user: SessionPrincipalDto = {
    id: signupResult.value.id,
    role: signupResult.value.role,
  };

  const sessionResult = await deps.sessionService.establish(user);

  if (!sessionResult.ok) {
    return Err(sessionResult.error);
  }

  return Ok(sessionResult.value);
}
