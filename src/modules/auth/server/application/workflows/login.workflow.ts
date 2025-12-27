import "server-only";

import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { SessionPrincipalDto } from "@/modules/auth/server/application/types/dtos/session-principal.dto";
import type { LoginUseCase } from "@/modules/auth/server/application/use-cases/user/login.use-case";
import type { AuthLoginSchemaDto } from "@/modules/auth/shared/domain/user/auth-user.schema";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the login "story":
 * - authenticate user credentials
 * - establish a session for the authenticated user
 *
 * Maps specific authentication failures to a unified credential error
 * to protect against account enumeration.
 */
export async function loginWorkflow(
  input: Readonly<AuthLoginSchemaDto>,
  deps: Readonly<{
    loginUseCase: LoginUseCase;
    sessionService: SessionService;
  }>,
): Promise<Result<SessionPrincipalDto, AppError>> {
  const authResult = await deps.loginUseCase.execute(input);

  if (!authResult.ok) {
    const error = authResult.error;
    const isCredentialFailure =
      error.key === "invalid_credentials" || error.key === "not_found";

    if (isCredentialFailure) {
      return Err(
        makeAppError(APP_ERROR_KEYS.invalid_credentials, {
          cause: "Authentication failed due to invalid email or password.",
          message: "Login workflow failed for some reason.",
          metadata: {
            code: "invalidCredentials",
          },
        }),
      );
    }

    return Err(error);
  }

  const user: SessionPrincipalDto = {
    id: authResult.value.id,
    role: authResult.value.role,
  };

  const sessionResult = await deps.sessionService.establish(user);

  if (!sessionResult.ok) {
    return Err(sessionResult.error);
  }

  return Ok(sessionResult.value);
}
