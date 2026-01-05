import "server-only";

import type { SessionAdapterContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { SignupCommand } from "@/modules/auth/application/use-cases/commands/signup.command";
import type { AuthSignupSchemaDto } from "@/modules/auth/domain/schemas/auth-user.schema";
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
    createUserUseCase: SignupCommand;
    sessionService: SessionAdapterContract;
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
