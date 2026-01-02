import "server-only";

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

export type TerminateSessionDeps = Readonly<{
  logger: LoggingClientContract;
  store: SessionStoreContract;
}>;

/**
 * Terminates a session by deleting the cookie.
 * Logs the termination reason for auditing.
 */
export class TerminateSessionCommand {
  private readonly logger: LoggingClientContract;
  private readonly store: SessionStoreContract;

  constructor(deps: TerminateSessionDeps) {
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "terminateSession",
    });
    this.store = deps.store;
  }

  async execute(
    reason: TerminateSessionReason,
  ): Promise<Result<void, AppError>> {
    try {
      await this.store.delete();

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
