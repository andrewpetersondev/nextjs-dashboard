import "server-only";

import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { setSessionCookieAndLogHelper } from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * Establishes a new session for a user.
 *
 * This use case handles issuing a new session token and persisting it
 * to the session store (e.g., setting a cookie).
 */
export class EstablishSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionStore: SessionStoreContract;
  private readonly sessionTokenService: SessionTokenServiceContract;

  /**
   * @param deps - Dependencies required for session establishment.
   */
  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLoggerHelper(deps.logger, "establishSession");
    this.sessionStore = deps.sessionStore;
    this.sessionTokenService = deps.sessionTokenService;
  }

  /**
   * Executes the session establishment logic.
   *
   * @param user - The user principal for whom the session is being established.
   * @returns A Result containing the session principal or an AppError.
   *
   * @throws {Error} If an unexpected system failure occurs (wrapped in Result).
   */
  execute(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>> {
    return safeExecute(
      async () => {
        const issuedResult = await this.sessionTokenService.issue({
          role: user.role,
          userId: user.id,
        });

        if (!issuedResult.ok) {
          return issuedResult;
        }

        const { expiresAtMs, token } = issuedResult.value;

        await setSessionCookieAndLogHelper(
          {
            logger: this.logger,
            sessionCookieAdapter: this.sessionStore,
          },
          {
            expiresAtMs,
            identifiers: {
              role: user.role,
              userId: user.id,
            },
            message: "Session established",
            operationName: "session.establish.success",
            token,
          },
        );

        return Ok(user);
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while establishing the session.",
        operation: "establishSession",
      },
    );
  }
}
