import "server-only";

import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { setSessionCookieAndLogHelper } from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { SessionIdentityDto } from "@/modules/auth/domain/types/session-identity.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * EstablishSessionUseCase
 *
 * Single-capability application use-case:
 * - Issue a new session token via SessionTokenService
 * - Persist it via SessionStore
 */
export class EstablishSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionStore: SessionStoreContract;
  private readonly sessionTokenService: SessionTokenServiceContract;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLoggerHelper(deps.logger, "establishSession");
    this.sessionStore = deps.sessionStore;
    this.sessionTokenService = deps.sessionTokenService;
  }

  execute(
    user: SessionIdentityDto,
  ): Promise<Result<SessionIdentityDto, AppError>> {
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
