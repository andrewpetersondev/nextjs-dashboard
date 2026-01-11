import "server-only";

import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { UpdateSessionOutcomeDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { readSessionTokenHelper } from "@/modules/auth/application/helpers/read-session-token.helper";
import { setSessionCookieAndLogHelper } from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * RotateSessionUseCase
 *
 * Single-capability: Performs the actual rotation of a valid session.
 * Assumes the session has already been validated and deemed eligible for rotation.
 */
export class RotateSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionStore: SessionStoreContract;
  private readonly sessionTokenService: SessionTokenServiceContract;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLoggerHelper(deps.logger, "rotateSession");
    this.sessionStore = deps.sessionStore;
    this.sessionTokenService = deps.sessionTokenService;
  }

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: false positive (rotation flow is intentionally verbose)
  execute(): Promise<Result<UpdateSessionOutcomeDto, AppError>> {
    return safeExecute<UpdateSessionOutcomeDto>(
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

        if (outcome.kind !== "decoded" || !outcome.decoded.userId) {
          return Ok({
            reason: "invalid_or_missing_user",
            refreshed: false,
          } as const);
        }

        const { userId, role, sessionStart } = outcome.decoded;

        const issuedResult = await this.sessionTokenService.issue({
          role,
          sessionStart,
          userId: userIdCodec.decode(userId),
        });

        if (!issuedResult.ok) {
          return Err(issuedResult.error);
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
              reason: "rotated",
              role,
              userId: userIdCodec.decode(userId),
            },
            message: "Session rotated successfully",
            operationName: "session.rotate.success",
            token,
          },
        );

        // todo: create a builder pattern for this dto `buildXXX`
        return Ok({
          expiresAt: expiresAtMs,
          reason: "rotated",
          refreshed: true,
          role,
          userId: userIdCodec.decode(userId),
        });
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while rotating the session.",
        operation: "rotateSession",
      },
    );
  }
}
