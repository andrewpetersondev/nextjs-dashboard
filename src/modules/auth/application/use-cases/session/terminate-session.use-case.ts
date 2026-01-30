import "server-only";
import { AUTH_USE_CASE_NAMES } from "@/modules/auth/application/constants/auth-logging.constants";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { deleteSessionCookieAndLogHelper } from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import type { SessionUseCaseDeps } from "@/modules/auth/application/use-cases/session/session-use-case.deps";
import type { TerminateSessionReason } from "@/modules/auth/domain/policies/session/evaluate-session-lifecycle.policy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

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
        await deleteSessionCookieAndLogHelper(
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
