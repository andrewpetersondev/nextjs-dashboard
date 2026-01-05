import "server-only";

import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export type TerminateSessionReason =
  | "absolute_limit_exceeded"
  | "expired"
  | "invalid_token"
  | "user_logout";

/**
 * Terminates a session by deleting the cookie.
 * Logs the termination reason for auditing.
 */
export class TerminateSessionCommand {
  private readonly logger: LoggingClientContract;
  private readonly sessionCookieAdapter: SessionStoreContract;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "terminateSession",
    });
    this.sessionCookieAdapter = deps.sessionCookieAdapter;
  }

  async execute(
    reason: TerminateSessionReason,
  ): Promise<Result<void, AppError>> {
    try {
      await this.sessionCookieAdapter.delete();

      this.logger.operation("info", "Session terminated", {
        operationContext: "session",
        operationIdentifiers: { reason },
        operationName: "session.terminate.success",
      });

      return Ok(undefined);
    } catch (err: unknown) {
      this.logger.errorWithDetails("Failed to terminate session", err, {
        operation: "terminateSession",
        reason,
      });

      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
