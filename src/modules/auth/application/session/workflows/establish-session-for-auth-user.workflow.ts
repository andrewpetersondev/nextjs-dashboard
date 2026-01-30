import "server-only";
import type { AuthenticatedUserDto } from "@/modules/auth/application/authn/dtos/authenticated-user.dto";
import type { SessionServiceContract } from "@/modules/auth/application/session/contracts/session-service.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/session/dtos/session-principal.dto";
import { toSessionPrincipal } from "@/modules/auth/application/session/mappers/to-session-principal.mapper";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Shared sub-workflow to establish a session after a user has been authenticated or created.
 *
 * This workflow centralizes the transformation from an authenticated user DTO
 * to a session principal and then delegates session establishment to the session service.
 *
 * @param authUserResult - The result of a login or signup operation.
 * @param deps - Workflow dependencies (session service).
 * @returns A Result containing the session principal or an AppError.
 */
export async function establishSessionForAuthUserWorkflow(
  authUserResult: Result<AuthenticatedUserDto, AppError>,
  deps: Readonly<{ sessionService: SessionServiceContract }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  if (!authUserResult.ok) {
    return Err(authUserResult.error);
  }

  const principal = toSessionPrincipal(authUserResult.value);

  return await deps.sessionService.establish(principal);
}
