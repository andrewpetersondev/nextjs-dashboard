import "server-only";

import type { AuthUserService } from "@/modules/auth/server/application/services/auth-user.service";
import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { SessionPrincipal } from "@/modules/auth/server/application/types/session-principal.types";
import type { LoginData } from "@/modules/auth/shared/domain/user/auth.schema";
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/shared/ui/auth-error-messages";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Orchestrates the login "story":
 * - authenticate user credentials
 * - establish a session for the authenticated user
 *
 * Maps specific authentication failures to a unified credential error
 * to protect against account enumeration.
 */
export async function loginWorkflow(
  input: Readonly<LoginData>,
  deps: Readonly<{
    authUserService: AuthUserService;
    sessionService: SessionService;
  }>,
): Promise<Result<SessionPrincipal, AppError>> {
  const authResult = await deps.authUserService.login(input);

  if (!authResult.ok) {
    const error = authResult.error;
    const isCredentialFailure =
      error.code === "invalid_credentials" || error.code === "not_found";

    if (isCredentialFailure) {
      return Err(
        makeValidationError({
          cause: "",
          message: AUTH_ERROR_MESSAGES.LOGIN_FAILED,
          metadata: {
            code: "invalidCredentials",
          },
        }),
      );
    }

    return Err(error);
  }

  const user: SessionPrincipal = {
    id: authResult.value.id,
    role: authResult.value.role,
  };

  const sessionResult = await deps.sessionService.establish(user);

  if (!sessionResult.ok) {
    return Err(sessionResult.error);
  }

  return Ok(sessionResult.value);
}
