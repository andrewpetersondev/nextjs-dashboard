import "server-only";
import {
  AUTH_OPERATIONS,
  AUTH_USE_CASE_NAMES,
} from "@/modules/auth/application/constants/auth-logging.constants";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { setSessionCookieAndLogHelper } from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import type { SessionUseCaseDeps } from "@/modules/auth/application/use-cases/session/session-use-case.deps";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
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
  constructor(deps: SessionUseCaseDeps) {
    this.logger = makeAuthUseCaseLoggerHelper(
      deps.logger,
      AUTH_USE_CASE_NAMES.ESTABLISH_SESSION,
    );
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

        const cookieResult = await setSessionCookieAndLogHelper(
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
            operationName: AUTH_OPERATIONS.SESSION_ESTABLISH_SUCCESS,
            token,
          },
        );

        if (!cookieResult.ok) {
          return Err(cookieResult.error);
        }

        return Ok(user);
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while establishing the session.",
        operation: AUTH_USE_CASE_NAMES.ESTABLISH_SESSION,
      },
    );
  }
}
