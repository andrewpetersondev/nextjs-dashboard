import "server-only";

import { buildUpdateSessionSuccess } from "@/modules/auth/application/builders/update-session-outcome.builder";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { UpdateSessionOutcomeDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { readSessionTokenHelper } from "@/modules/auth/application/helpers/read-session-token.helper";
import { setSessionCookieAndLogHelper } from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import { UserIdSchema } from "@/modules/auth/application/schemas/session-token-claims.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * Performs rotation of a valid session.
 *
 * This use case handles the actual process of issuing a new rotated token
 * (reusing the session ID but getting a new JWT ID) and updating the session store.
 * It assumes the session has already been validated.
 */
export class RotateSessionUseCase {
  private readonly logger: LoggingClientContract;
  private readonly sessionStore: SessionStoreContract;
  private readonly sessionTokenService: SessionTokenServiceContract;

  /**
   * @param deps - Dependencies required for session rotation.
   */
  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLoggerHelper(deps.logger, "rotateSession");
    this.sessionStore = deps.sessionStore;
    this.sessionTokenService = deps.sessionTokenService;
  }

  /**
   * Executes the session rotation logic.
   *
   * @returns A Result containing the update session outcome DTO.
   *
   * @throws {Error} If an unexpected system failure occurs (wrapped in Result).
   */
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

        if (outcome.kind !== "decoded" || !outcome.decoded.sub) {
          return Ok({
            reason: "invalid_or_missing_user",
            refreshed: false,
          } as const);
        }

        const { sid, sub, role } = outcome.decoded;

        const issuedResult = await this.sessionTokenService.issueRotated({
          role,
          sid,
          userId: UserIdSchema.decode(sub),
        });

        if (!issuedResult.ok) {
          return Err(issuedResult.error);
        }

        const { expiresAtMs, token } = issuedResult.value;

        const decodedUserId = UserIdSchema.decode(sub);

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
              userId: decodedUserId,
            },
            message: "Session rotated successfully",
            operationName: "session.rotate.success",
            token,
          },
        );

        return Ok(
          buildUpdateSessionSuccess({
            expiresAtMs,
            role,
            userId: decodedUserId,
          }),
        );
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while rotating the session.",
        operation: "rotateSession",
      },
    );
  }
}
