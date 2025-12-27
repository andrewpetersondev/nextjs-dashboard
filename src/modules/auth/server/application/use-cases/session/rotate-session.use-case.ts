import "server-only";

import type {
  SessionContract,
  SessionTokenCodecPort,
} from "@/modules/auth/server/application/contracts/session.contract";
import {
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
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

const ONE_SECOND_MS = 1000 as const;
const MAX_ABSOLUTE_SESSION_MS = 2_592_000_000 as const;

type RotateSessionDeps = Readonly<{
  cookie: SessionContract;
  jwt: SessionTokenCodecPort;
  logger: LoggingClientPort;
}>;

/** Compute absolute lifetime status from immutable sessionStart. */
function absoluteLifetime(user?: { sessionStart?: number; userId?: string }): {
  age: number;
  exceeded: boolean;
} {
  const start = user?.sessionStart ?? 0;
  const age = Date.now() - start;
  return { age, exceeded: !start || age > MAX_ABSOLUTE_SESSION_MS };
}

/**
 * Milliseconds remaining until token expiry (negative if expired).
 *
 * Prefers `expiresAt` (ms) when present; falls back to `exp` (seconds).
 */
function timeLeftMs(payload?: { exp?: number; expiresAt?: number }): number {
  if (payload?.expiresAt && Number.isFinite(payload.expiresAt)) {
    return payload.expiresAt - Date.now();
  }
  const expMs = (payload?.exp ?? 0) * ONE_SECOND_MS;
  return expMs - Date.now();
}

function shouldRefreshToken(decoded: { exp?: number; expiresAt?: number }): {
  refresh: boolean;
  timeLeftMs: number;
} {
  const remaining = timeLeftMs({
    exp: decoded.exp,
    expiresAt: decoded.expiresAt,
  });
  return {
    refresh: remaining <= SESSION_REFRESH_THRESHOLD_MS,
    timeLeftMs: remaining,
  };
}

async function issueToken(
  jwt: SessionTokenCodecPort,
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
  private readonly cookie: SessionContract;
  private readonly jwt: SessionTokenCodecPort;
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
        return Ok({ reason: "no_cookie", refreshed: false });
      }

      const decodedResult = await this.jwt.decode(current);

      if (!decodedResult.ok) {
        return Ok({ reason: "invalid_or_missing_user", refreshed: false });
      }

      const decoded = decodedResult.value;

      if (!decoded.userId) {
        return Ok({ reason: "invalid_or_missing_user", refreshed: false });
      }

      const user = {
        role: decoded.role,
        sessionStart: decoded.sessionStart,
        userId: userIdCodec.decode(decoded.userId),
      };

      const { age, exceeded } = absoluteLifetime(user);

      if (exceeded) {
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
