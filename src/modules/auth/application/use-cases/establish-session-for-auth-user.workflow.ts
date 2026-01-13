import "server-only";

import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { toSessionPrincipalPolicy } from "@/modules/auth/application/mappers/to-session-principal-policy.mapper";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Shared sub-workflow to establish a session after a user has been authenticated or created.
 *
 * Centralizes the transformation from AuthUserOutputDto to SessionPrincipalDto.
 */
export async function establishSessionForAuthUserWorkflow(
  authUserResult: Result<AuthenticatedUserDto, AppError>,
  deps: Readonly<{ sessionService: SessionServiceContract }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  if (!authUserResult.ok) {
    return Err(authUserResult.error);
  }

  const principal = toSessionPrincipalPolicy(authUserResult.value);

  return await deps.sessionService.establish(principal);
}
