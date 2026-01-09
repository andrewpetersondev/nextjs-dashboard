import "server-only";

import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { deleteSessionCookieAndLogHelper } from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import type { TerminateSessionReason } from "@/modules/auth/domain/policies/session.policy";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * Terminates a session by deleting the cookie.
 * Logs the termination reason for auditing.
 */
export class TerminateSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionCookieAdapter: SessionStoreContract;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLoggerHelper(deps.logger, "terminateSession");
    this.sessionCookieAdapter = deps.sessionCookieAdapter;
  }

  execute(reason: TerminateSessionReason): Promise<Result<void, AppError>> {
    return safeExecute(
      async () => {
        await deleteSessionCookieAndLogHelper(
          {
            logger: this.logger,
            sessionCookieAdapter: this.sessionCookieAdapter,
          },
          {
            identifiers: { reason },
            message: "Session terminated successfully",
            operationName: "session.terminate.success",
          },
        );

        return Ok(undefined);
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred during session termination.",
        operation: "terminateSession",
      },
    );
  }
}
