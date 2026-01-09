import "server-only";

import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { makeAuthUseCaseLogger } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { setSessionCookieAndLog } from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
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
 * - Persist it via SessionStoreContract
 */
export class EstablishSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionCookieAdapter: SessionStoreContract;
  private readonly sessionTokenAdapter: SessionTokenServiceContract;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLogger(deps.logger, "establishSession");
    this.sessionCookieAdapter = deps.sessionCookieAdapter;
    this.sessionTokenAdapter = deps.sessionTokenAdapter;
  }

  execute(
    user: SessionPrincipalDto,
  ): Promise<Result<SessionPrincipalDto, AppError>> {
    return safeExecute(
      async () => {
        const sessionStart = Date.now();

        const issuedResult = await this.sessionTokenAdapter.issue({
          role: user.role,
          sessionStart,
          userId: user.id,
        });

        if (!issuedResult.ok) {
          return issuedResult;
        }

        const { expiresAtMs, token } = issuedResult.value;

        await setSessionCookieAndLog(
          {
            logger: this.logger,
            sessionCookieAdapter: this.sessionCookieAdapter,
          },
          {
            expiresAtMs,
            identifiers: {
              role: user.role,
              sessionStart,
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
