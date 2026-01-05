import "server-only";

import type { UpdateSessionOutcome } from "@/modules/auth/domain/policies/session.policy";
import {
  evaluateSessionLifecycle,
  requiresRotation,
  requiresTermination,
} from "@/modules/auth/domain/policies/session-lifecycle.policy";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { SessionTokenAdapter } from "@/modules/auth/infrastructure/adapters/session-token.adapter";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export type RotateSessionDeps = Readonly<{
  logger: LoggingClientContract;
  sessionCookieAdapter: SessionStoreContract;
  sessionTokenAdapter: SessionTokenAdapter;
}>;

/**
 * Silently cleans up an invalid session token.
 *
 * Swallows errors since cleanup is best-effort.
 */
export async function cleanupInvalidToken(
  sessionCookieAdapter: SessionStoreContract,
): Promise<void> {
  try {
    await sessionCookieAdapter.delete();
  } catch {
    // ignore cleanup failure - best effort
  }
}

/**
 * RotateSessionUseCase
 *
 * Single-capability verb:
 * - Evaluates session lifecycle using pure policy function
 * - If rotation needed, re-issues token and sets cookie
 * - If termination needed, deletes cookie
 */
export class RotateSessionCommand {
  private readonly logger: LoggingClientContract;
  private readonly sessionCookieAdapter: SessionStoreContract;
  private readonly sessionTokenAdapter: SessionTokenAdapter;

  constructor(deps: RotateSessionDeps) {
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "rotateSession",
    });
    this.sessionCookieAdapter = deps.sessionCookieAdapter;
    this.sessionTokenAdapter = deps.sessionTokenAdapter;
  }

  async execute(): Promise<Result<UpdateSessionOutcome, AppError>> {
    try {
      const current = await this.sessionCookieAdapter.get();

      if (!current) {
        this.logger.operation("debug", "Session rotation skipped: no cookie", {
          operationContext: "session",
          operationIdentifiers: { reason: "no_cookie" },
          operationName: "session.rotate.no_cookie",
        });
        return Ok({ reason: "no_cookie", refreshed: false });
      }

      const decodedResult = await this.sessionTokenAdapter.decode(current);

      if (!decodedResult.ok) {
        this.logger.operation("warn", "Session rotation failed: decode error", {
          operationContext: "session",
          operationIdentifiers: { reason: "decode_failed" },
          operationName: "session.rotate.decode_failed",
        });
        await cleanupInvalidToken(this.sessionCookieAdapter);
        return Ok({ reason: "invalid_or_missing_user", refreshed: false });
      }

      const decoded = decodedResult.value;
      const decision = evaluateSessionLifecycle(decoded, decoded.sessionStart);

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
    } catch (err: unknown) {
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }

  private async handleTermination(
    decision: Extract<
      ReturnType<typeof evaluateSessionLifecycle>,
      { action: "terminate" }
    >,
    decoded: { userId: string; role: string },
  ): Promise<Result<UpdateSessionOutcome, AppError>> {
    this.logger.operation("info", `Session terminated: ${decision.reason}`, {
      operationContext: "session",
      operationIdentifiers: {
        ageMs: decision.ageMs,
        maxMs: decision.maxMs,
        reason: decision.reason,
        role: decoded.role,
        userId: decoded.userId,
      },
      operationName: `session.rotate.${decision.reason}`,
    });

    await this.sessionCookieAdapter.delete();

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
    role: Parameters<SessionTokenAdapter["issue"]>[0]["role"];
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

    await this.sessionCookieAdapter.set(token, expiresAtMs);

    this.logger.operation("info", "Session rotated successfully", {
      operationContext: "session",
      operationIdentifiers: {
        expiresAt: expiresAtMs,
        reason: "rotated",
        role: user.role,
        userId: user.userId,
      },
      operationName: "session.rotate.success",
    });

    return Ok({
      expiresAt: expiresAtMs,
      reason: "rotated",
      refreshed: true,
      role: user.role,
      userId: user.userId,
    });
  }
}
