import "server-only";

import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import { makeAuthUseCaseLogger } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { readSessionToken } from "@/modules/auth/application/helpers/read-session-token.helper";
import { setSessionCookieAndLog } from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import type { UpdateSessionOutcome } from "@/modules/auth/domain/policies/session.policy";
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
  private readonly sessionCookieAdapter: SessionStoreContract;
  private readonly sessionTokenAdapter: SessionTokenServiceContract;

  constructor(deps: SessionUseCaseDependencies) {
    this.logger = makeAuthUseCaseLogger(deps.logger, "rotateSession");
    this.sessionCookieAdapter = deps.sessionCookieAdapter;
    this.sessionTokenAdapter = deps.sessionTokenAdapter;
  }

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
  execute(): Promise<Result<UpdateSessionOutcome, AppError>> {
    return safeExecute<UpdateSessionOutcome>(
      async () => {
        const readResult = await readSessionToken(
          {
            sessionCookieAdapter: this.sessionCookieAdapter,
            sessionTokenAdapter: this.sessionTokenAdapter,
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

        const user = {
          // todo: i do not like casting. i think i have a function for this
          role: role as "ADMIN" | "USER" | "GUEST",
          sessionStart,
          userId: userIdCodec.decode(userId),
        };

        const issuedResult = await this.sessionTokenAdapter.issue(user);

        if (!issuedResult.ok) {
          return Err(issuedResult.error);
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
              reason: "rotated",
              role: user.role,
              userId: user.userId,
            },
            message: "Session rotated successfully",
            operationName: "session.rotate.success",
            token,
          },
        );

        return Ok({
          expiresAt: expiresAtMs,
          reason: "rotated",
          refreshed: true,
          role: user.role,
          userId: user.userId,
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
