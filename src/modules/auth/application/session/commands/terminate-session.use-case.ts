import "server-only";
import type { SessionUseCaseDeps } from "@/modules/auth/application/session/commands/session-use-case.deps";
import type { SessionStoreContract } from "@/modules/auth/application/session/contracts/session-store.contract";
import { deleteSessionCookieAndLogHelper } from "@/modules/auth/application/shared/helpers/session-cookie-ops.helper";
import { AUTH_USE_CASE_NAMES } from "@/modules/auth/application/shared/logging/auth-logging.constants";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/shared/logging/make-auth-use-case-logger.helper";
import type { TerminateSessionReason } from "@/modules/auth/domain/session/policies/lifecycle/evaluate-session-lifecycle.policy";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { safeExecute } from "@/shared/core/results/integrations/safe-execute";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Terminates an active session.
 *
 * This use case handles the removal of the session token from storage
 * (e.g., deleting a cookie) and logs the termination reason.
 */
export class TerminateSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionStore: SessionStoreContract;

  /**
   * @param deps - Dependencies required for session termination.
   */
  constructor(deps: SessionUseCaseDeps) {
    this.logger = makeAuthUseCaseLoggerHelper(
      deps.logger,
      AUTH_USE_CASE_NAMES.TERMINATE_SESSION,
    );
    this.sessionStore = deps.sessionStore;
  }

  /**
   * Executes the session termination logic.
   *
   * @param reason - The reason for terminating the session.
   * @returns A Result indicating success or an AppError.
   *
   * @throws {Error} If an unexpected system failure occurs (wrapped in Result).
   */
  execute(reason: TerminateSessionReason): Promise<Result<void, AppError>> {
    return safeExecute(
      async () => {
        const deleteResult = await deleteSessionCookieAndLogHelper(
          {
            logger: this.logger,
            sessionCookieAdapter: this.sessionStore,
          },
          {
            identifiers: { reason },
            message: "Session terminated successfully",
            operationName: "session.terminate.success",
          },
        );

        if (!deleteResult.ok) {
          return Err(deleteResult.error);
        }

        return Ok(undefined);
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred during session termination.",
        operation: AUTH_USE_CASE_NAMES.TERMINATE_SESSION,
      },
    );
  }
}
