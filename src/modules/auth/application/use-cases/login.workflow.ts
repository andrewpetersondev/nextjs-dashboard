import "server-only";

import type { SessionAdapterContract } from "@/modules/auth/application/contracts/session-adapter.contract";
import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case";
import type { AuthLoginSchemaDto } from "@/modules/auth/domain/schemas/auth-user.schema";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Maps an authenticated user payload to a session principal DTO.
 *
 * @param value - Authenticated user payload containing identity and role.
 * @returns Session principal DTO.
 */
const toSessionPrincipal = (value: AuthUserOutputDto): SessionPrincipalDto => ({
  id: value.id,
  role: value.role,
});

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
    sessionService: SessionAdapterContract;
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

  const user = toSessionPrincipal(authResult.value);

  const sessionResult = await deps.sessionService.establish(user);

  if (!sessionResult.ok) {
    return Err(sessionResult.error);
  }

  return Ok(sessionResult.value);
}
