import "server-only";

import { buildReadSessionOutcome } from "@/modules/auth/application/builders/read-session-outcome.builder";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { ReadSessionOutcomeDto } from "@/modules/auth/application/dtos/read-session-outcome.dto";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { readSessionTokenHelper } from "@/modules/auth/application/helpers/read-session-token.helper";
import { cleanupInvalidTokenHelper } from "@/modules/auth/application/helpers/session-cleanup.helper";
import { toSessionEntity } from "@/modules/auth/application/mappers/to-session-entity.mapper";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * Reads and decodes the current session.
 *
 * This use case handles retrieving the session token from storage,
 * decoding it, and returning a detailed session outcome.
 * If the token is invalid, it may perform cleanup depending on the internal helper configuration.
 */
export class ReadSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionStore: SessionStoreContract;
  private readonly sessionTokenService: SessionTokenServiceContract;

  /**
   * @param deps - Dependencies required for reading the session.
   */
  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLoggerHelper(deps.logger, "readSession");
    this.sessionStore = deps.sessionStore;
    this.sessionTokenService = deps.sessionTokenService;
  }

  /**
   * Executes the session reading logic.
   *
   * @returns A Result containing the session outcome DTO or undefined if no valid session exists.
   *
   * @throws {Error} If an unexpected system failure occurs (wrapped in Result).
   */
  execute(): Promise<Result<ReadSessionOutcomeDto | undefined, AppError>> {
    return safeExecute<ReadSessionOutcomeDto | undefined>(
      async () => {
        const readResult = await readSessionTokenHelper(
          {
            sessionStore: this.sessionStore,
            sessionTokenService: this.sessionTokenService,
          },
          { cleanupOnInvalidToken: true },
        );

        if (!readResult.ok) {
          return readResult;
        }

        const outcome = readResult.value;

        if (outcome.kind !== "decoded") {
          return Ok(undefined);
        }

        const decoded = outcome.decoded;

        // Ensure we have a valid identity before converting to session
        if (!decoded.sub) {
          await cleanupInvalidTokenHelper(this.sessionStore);
          this.logger.operation("warn", "Session missing subject (sub)", {
            operationContext: "session",
            operationIdentifiers: { reason: "invalid_claims" },
            operationName: "session.read.invalid_claims",
          });
          return Ok(undefined);
        }

        const sessionEntity = toSessionEntity(decoded);
        return Ok(buildReadSessionOutcome(sessionEntity));
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while reading the session.",
        operation: "getSession",
      },
    );
  }
}
