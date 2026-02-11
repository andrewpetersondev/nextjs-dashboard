import "server-only";
import { buildReadSessionOutcome } from "@/modules/auth/application/session/builders/read-session-outcome.builder";
import type { SessionUseCaseDeps } from "@/modules/auth/application/session/commands/session-use-case.deps";
import type { SessionStoreContract } from "@/modules/auth/application/session/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/session/contracts/session-token-service.contract";
import type { ReadSessionOutcomeDto } from "@/modules/auth/application/session/dtos/responses/read-session-outcome.dto";
import { toSessionEntity } from "@/modules/auth/application/session/mappers/to-session-entity.mapper";
import { readSessionTokenHelper } from "@/modules/auth/application/shared/helpers/read-session-token.helper";
import { cleanupInvalidTokenHelper } from "@/modules/auth/application/shared/helpers/session-cleanup.helper";
import {
  AUTH_LOG_CONTEXTS,
  AUTH_OPERATIONS,
  AUTH_USE_CASE_NAMES,
} from "@/modules/auth/application/shared/logging/auth-logging.constants";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/shared/logging/make-auth-use-case-logger.helper";
import { toUnixSeconds } from "@/modules/auth/domain/session/value-objects/time.value";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { safeExecute } from "@/shared/core/results/integrations/safe-execute";
import { Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { nowInSeconds } from "@/shared/time/time.constants";

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
  constructor(deps: SessionUseCaseDeps) {
    this.logger = makeAuthUseCaseLoggerHelper(
      deps.logger,
      AUTH_USE_CASE_NAMES.READ_SESSION,
    );
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
            logger: this.logger,
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

        const nowSec = toUnixSeconds(nowInSeconds());

        const sessionEntity = toSessionEntity(decoded);

        const built = buildReadSessionOutcome(sessionEntity, nowSec);
        if (!built.ok) {
          await cleanupInvalidTokenHelper(
            { logger: this.logger, sessionStore: this.sessionStore },
            { reason: "invalid_session_state", source: "readSessionUseCase" },
          );

          this.logger.operation("warn", "Session outcome build failed", {
            operationContext: AUTH_LOG_CONTEXTS.SESSION,
            operationIdentifiers: { reason: built.error.key },
            operationName: AUTH_OPERATIONS.SESSION_READ_INVALID_CLAIMS,
          });

          return Ok(undefined);
        }

        return Ok(built.value);
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while reading the session.",
        operation: AUTH_USE_CASE_NAMES.READ_SESSION,
      },
    );
  }
}
