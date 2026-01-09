import "server-only";

import type { SessionAdapterContract } from "@/modules/auth/application/contracts/session-adapter.contract";
import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { toSessionPrincipal } from "@/modules/auth/domain/policies/session.policy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Shared sub-workflow to establish a session after a user has been authenticated or created.
 *
 * Centralizes the transformation from AuthUserOutputDto to SessionPrincipalDto.
 */
export async function establishSessionForAuthUserWorkflow(
  authUserResult: Result<AuthUserOutputDto, AppError>,
  deps: Readonly<{ sessionService: SessionAdapterContract }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  if (!authUserResult.ok) {
    return Err(authUserResult.error);
  }

  const principal = toSessionPrincipal(authUserResult.value);

  return await deps.sessionService.establish(principal);
}
