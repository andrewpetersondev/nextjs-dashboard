import "server-only";

import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import { makeAuthUseCaseLogger } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { readSessionToken } from "@/modules/auth/application/helpers/read-session-token.helper";
import { cleanupInvalidToken } from "@/modules/auth/application/helpers/session-cleanup.helper";
import {
  deleteSessionCookieAndLog,
  setSessionCookieAndLog,
} from "@/modules/auth/application/helpers/session-cookie-ops.helper";
import type { UpdateSessionOutcome } from "@/modules/auth/domain/policies/session.policy";
import {
  evaluateSessionLifecycle,
  requiresRotation,
  requiresTermination,
} from "@/modules/auth/domain/policies/session-lifecycle.policy";
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
 * Single-capability verb:
 * - Evaluates session lifecycle using pure policy function
 * - If rotation needed, re-issues token and sets cookie
 * - If termination needed, deletes cookie
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
    return safeExecute(
      // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
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

        if (outcome.kind === "missing_token") {
          this.logger.operation(
            "debug",
            "Session rotation skipped: no cookie",
            {
              operationContext: "session",
              operationIdentifiers: { reason: "no_cookie" },
              operationName: "session.rotate.no_cookie",
            },
          );
          return Ok({ reason: "no_cookie", refreshed: false });
        }

        if (outcome.kind === "invalid_token") {
          this.logger.operation(
            "warn",
            "Session rotation failed: decode error",
            {
              operationContext: "session",
              operationIdentifiers: { reason: "decode_failed" },
              operationName: "session.rotate.decode_failed",
            },
          );
          return Ok({ reason: "invalid_or_missing_user", refreshed: false });
        }

        const decoded = outcome.decoded;

        // Type safety for policy: decision needs userId
        if (!decoded.userId) {
          await cleanupInvalidToken(this.sessionCookieAdapter);
          return Ok({ reason: "invalid_or_missing_user", refreshed: false });
        }

        const decision = evaluateSessionLifecycle(
          decoded,
          decoded.sessionStart,
        );

        if (requiresTermination(decision)) {
          return this.handleTermination(decision, decoded);
        }

        if (requiresRotation(decision)) {
          return this.handleRotation(decoded);
        }

        this.logger.operation("debug", "Session rotation not needed", {
          operationContext: "session",
          operationIdentifiers: {
            reason: "not_needed",
            timeLeftMs: decision.timeLeftMs,
            userId: decoded.userId,
          },
          operationName: "session.rotate.not_needed",
        });

        return Ok({
          reason: "not_needed",
          refreshed: false,
          timeLeftMs: decision.timeLeftMs,
        });
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while rotating the session.",
        operation: "rotateSession",
      },
    );
  }

  private async handleTermination(
    decision: Extract<
      ReturnType<typeof evaluateSessionLifecycle>,
      { action: "terminate" }
    >,
    decoded: { userId: string; role: string },
  ): Promise<Result<UpdateSessionOutcome, AppError>> {
    await deleteSessionCookieAndLog(
      {
        logger: this.logger,
        sessionCookieAdapter: this.sessionCookieAdapter,
      },
      {
        identifiers: {
          ageMs: decision.ageMs,
          maxMs: decision.maxMs,
          reason: decision.reason,
          role: decoded.role,
          userId: decoded.userId,
        },
        message: `Session terminated: ${decision.reason}`,
        operationName: `session.rotate.${decision.reason}`,
      },
    );

    if (decision.reason === "absolute_limit_exceeded") {
      return Ok({
        ageMs: decision.ageMs,
        maxMs: decision.maxMs,
        reason: "absolute_lifetime_exceeded",
        refreshed: false,
      });
    }

    return Ok({
      reason: "invalid_or_missing_user",
      refreshed: false,
    });
  }

  private async handleRotation(decoded: {
    role: Parameters<SessionTokenServiceContract["issue"]>[0]["role"];
    sessionStart: number;
    userId: string;
  }): Promise<Result<UpdateSessionOutcome, AppError>> {
    const user = {
      role: decoded.role,
      sessionStart: decoded.sessionStart,
      userId: userIdCodec.decode(decoded.userId),
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
  }
}
