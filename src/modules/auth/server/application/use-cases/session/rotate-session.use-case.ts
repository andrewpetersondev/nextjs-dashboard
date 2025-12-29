import "server-only";

import type { SessionStoreContract } from "@/modules/auth/server/application/types/contracts/session-store.contract";
import type { SessionTokenCodecContract } from "@/modules/auth/server/application/types/contracts/session-token-codec.contract";
import {
  absoluteLifetime,
  MAX_ABSOLUTE_SESSION_MS,
  ONE_SECOND_MS,
  SESSION_DURATION_MS,
  shouldRefreshToken,
  type UpdateSessionOutcome,
} from "@/modules/auth/shared/domain/session/session.policy";
import { userIdCodec } from "@/modules/auth/shared/domain/session/session.schemas";
import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

type RotateSessionDeps = Readonly<{
  cookie: SessionStoreContract;
  jwt: SessionTokenCodecContract;
  logger: LoggingClientPort;
}>;

async function issueToken(
  jwt: SessionTokenCodecContract,
  input: Readonly<{
    role: UserRole;
    sessionStart: number;
    userId: UserId;
  }>,
): Promise<Result<{ expiresAtMs: number; token: string }, AppError>> {
  const now = Date.now();
  const expiresAtMs = now + SESSION_DURATION_MS;

  const claims = {
    exp: Math.floor(expiresAtMs / ONE_SECOND_MS),
    expiresAt: expiresAtMs,
    iat: Math.floor(now / ONE_SECOND_MS),
    role: input.role,
    sessionStart: input.sessionStart,
    userId: input.userId,
  };

  const encodedResult = await jwt.encode(claims, expiresAtMs);
  if (!encodedResult.ok) {
    return Err(encodedResult.error);
  }

  return Ok({ expiresAtMs, token: encodedResult.value });
}

/**
 * RotateSessionUseCase
 *
 * Single-capability verb:
 * - decide whether to refresh (policy)
 * - if needed, re-issue token and set cookie
 */
export class RotateSessionUseCase {
  private readonly cookie: SessionStoreContract;
  private readonly jwt: SessionTokenCodecContract;
  private readonly logger: LoggingClientPort;

  constructor(deps: RotateSessionDeps) {
    this.cookie = deps.cookie;
    this.jwt = deps.jwt;
    this.logger = deps.logger.child({
      scope: "use-case",
      useCase: "rotateSession",
    });
  }

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: rotate flow is inherently multi-step
  async execute(): Promise<Result<UpdateSessionOutcome, AppError>> {
    try {
      const current = await this.cookie.get();

      if (!current) {
        this.logger.operation("debug", "Session rotation skipped: no cookie", {
          operationContext: "session",
          operationIdentifiers: { reason: "no_cookie" },
          operationName: "session.rotate.no_cookie",
        });
        return Ok({ reason: "no_cookie", refreshed: false });
      }

      const decodedResult = await this.jwt.decode(current);

      if (!decodedResult.ok) {
        this.logger.operation("warn", "Session rotation failed: decode error", {
          operationContext: "session",
          operationIdentifiers: { reason: "decode_failed" },
          operationName: "session.rotate.decode_failed",
        });
        // hygiene: remove bad token
        try {
          await this.cookie.delete();
        } catch (_) {
          // ignore cleanup failure
        }
        return Ok({ reason: "invalid_or_missing_user", refreshed: false });
      }

      const decoded = decodedResult.value;

      if (!decoded.userId) {
        this.logger.operation(
          "warn",
          "Session rotation failed: missing userId",
          {
            operationContext: "session",
            operationIdentifiers: { reason: "missing_user_id" },
            operationName: "session.rotate.missing_user",
          },
        );
        try {
          await this.cookie.delete();
        } catch (_) {
          // ignore
        }
        return Ok({ reason: "invalid_or_missing_user", refreshed: false });
      }

      const user = {
        role: decoded.role,
        sessionStart: decoded.sessionStart,
        userId: userIdCodec.decode(decoded.userId),
      };

      const { age, exceeded } = absoluteLifetime(user);

      if (exceeded) {
        this.logger.operation(
          "info",
          "Session rotation denied: absolute lifetime exceeded",
          {
            operationContext: "session",
            operationIdentifiers: {
              ageMs: age,
              maxMs: MAX_ABSOLUTE_SESSION_MS,
              reason: "absolute_lifetime_exceeded",
              role: user.role,
              userId: user.userId,
            },
            operationName: "session.rotate.absolute_lifetime_exceeded",
          },
        );
        await this.cookie.delete();

        return Ok({
          ageMs: age,
          maxMs: MAX_ABSOLUTE_SESSION_MS,
          reason: "absolute_lifetime_exceeded",
          refreshed: false,
        });
      }

      const { refresh, timeLeftMs: remaining } = shouldRefreshToken(decoded);

      if (!refresh) {
        this.logger.operation("debug", "Session rotation not needed", {
          operationContext: "session",
          operationIdentifiers: {
            reason: "not_needed",
            timeLeftMs: remaining,
            userId: user.userId,
          },
          operationName: "session.rotate.not_needed",
        });
        return Ok({
          reason: "not_needed",
          refreshed: false,
          timeLeftMs: remaining,
        });
      }

      const issuedResult = await issueToken(this.jwt, user);

      if (!issuedResult.ok) {
        return Err(issuedResult.error);
      }

      const { expiresAtMs, token } = issuedResult.value;

      await this.cookie.set(token, expiresAtMs);

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
    } catch (err: unknown) {
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
