import "server-only";
import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";
import {
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
} from "@/modules/auth/domain/sessions/session.constants";
import { userIdCodec } from "@/modules/auth/domain/sessions/session.schemas";
import type { UpdateSessionResult } from "@/modules/auth/domain/sessions/session-payload.types";
import type {
  SessionPort,
  SessionTokenCodecPort,
} from "@/modules/auth/server/application/ports/session.port";
import type { UserId } from "@/shared/branding/brands";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { normalizeToAppError } from "@/shared/errors/normalizers/app-error.normalizer";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

const ONE_SECOND_MS = 1000 as const;
const MAX_ABSOLUTE_SESSION_MS = 2_592_000_000 as const;
const ROLLING_COOKIE_MAX_AGE_S = Math.floor(
  SESSION_DURATION_MS / ONE_SECOND_MS,
);

interface SessionUser {
  readonly id: UserId;
  readonly role: UserRole;
}

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
 * Refactored to support the new flat JWT claims shape. Prefers `expiresAt`
 * (milliseconds) when present; falls back to `exp` (seconds) for legacy callers.
 */
function timeLeftMs(payload?: { exp?: number; expiresAt?: number }): number {
  if (payload?.expiresAt && Number.isFinite(payload.expiresAt)) {
    return payload.expiresAt - Date.now();
  }
  const expMs = (payload?.exp ?? 0) * ONE_SECOND_MS;
  return expMs - Date.now();
}

const buildSessionCookieOptions = (expiresAtMs: number) =>
  ({
    expires: new Date(expiresAtMs),
    maxAge: ROLLING_COOKIE_MAX_AGE_S,
  }) as const;

/**
 * Determines if a session token should be refreshed based on remaining time.
 *
 * @param decoded - Decoded JWT payload
 * @returns Object indicating if refresh is needed and time remaining
 */
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

/**
 * Manages session lifecycle including establishment, rotation, and cleanup.
 *
 * Handles rolling session behavior with a 15-minute idle timeout and 30-day absolute limit.
 * Uses Result pattern for error handling and JWT tokens stored in secure cookies.
 *
 * @example
 * const manager = new SessionManager(cookieAdapter, jwtCodec, logger);
 * const result = await manager.establish({ id: userId, role: "admin" });
 */
export class SessionManager {
  private readonly cookie: SessionPort;
  private readonly jwt: SessionTokenCodecPort;
  private readonly logger: LoggingClientContract;

  constructor(
    cookie: SessionPort,
    jwt: SessionTokenCodecPort,
    logger: LoggingClientContract,
  ) {
    this.cookie = cookie;
    this.jwt = jwt;
    this.logger = logger.child({ scope: "service" });
  }

  /**
   * Establishes a new session for the given user.
   *
   * Creates a JWT token with role and session metadata, sets secure cookie,
   * and logs the establishment event.
   *
   * @param user - User object containing id and role
   * @returns Result containing the user on success, or AppError on failure
   */
  async establish(user: SessionUser): Promise<Result<SessionUser, AppError>> {
    const requestId = crypto.randomUUID();
    try {
      const now = Date.now();

      const expiresAtMs = now + SESSION_DURATION_MS;

      const claims = {
        exp: Math.floor(expiresAtMs / ONE_SECOND_MS),
        expiresAt: expiresAtMs,
        iat: Math.floor(now / ONE_SECOND_MS),
        role: user.role,
        sessionStart: now,
        userId: String(user.id),
      };

      const token = await this.jwt.encode(claims, expiresAtMs);

      await this.cookie.set(token, buildSessionCookieOptions(expiresAtMs));

      this.logger.info("Session established", {
        logging: { expiresAt: expiresAtMs, role: user.role, userId: user.id },
      });

      return Ok(user);
    } catch (err: unknown) {
      const base = normalizeToAppError(err, "unexpected");

      this.logger.error("Session establish failed", {
        error: String(err),
        logging: { code: "session_establish_failed" },
        requestId,
      });

      return Err(base);
    }
  }

  /**
   * Clears the current session by deleting the cookie.
   *
   * @returns Result with void on success, or AppError on failure
   */
  async clear(): Promise<Result<void, AppError>> {
    const requestId = crypto.randomUUID();
    try {
      await this.cookie.delete();

      this.logger.info("Session cleared", {
        logging: { context: "SessionManager.clear" },
      });

      return Ok<void>(undefined);
    } catch (err: unknown) {
      const base = normalizeToAppError(err, "unexpected");

      this.logger.error("Session clear failed", {
        error: String(err),
        logging: { code: "session_clear_failed" },
        requestId,
      });

      return Err(base);
    }
  }

  /**
   * Reads the current session from the cookie.
   *
   * Decodes the JWT token and extracts user role and id.
   * Returns undefined if no valid session exists.
   *
   * @returns Object with role and userId, or undefined if no session
   */
  async read(): Promise<{ role: UserRole; userId: UserId } | undefined> {
    try {
      const token = await this.cookie.get();

      if (!token) {
        this.logger.warn("No session cookie present", {
          logging: { reason: "no_cookie" },
        });
        return;
      }

      const decoded = await this.jwt.decode(token);

      if (!decoded?.userId) {
        this.logger.warn("Invalid session payload", {
          logging: { reason: "invalid_payload" },
        });
        return;
      }

      return { role: decoded.role, userId: userIdCodec.decode(decoded.userId) };
    } catch (err: unknown) {
      this.logger.error("Session read failed", {
        error: String(err),
        logging: { code: "session_read_failed" },
      });

      return;
    }
  }

  /**
   * Rotates the session token if necessary based on refresh threshold.
   *
   * Extends session expiration if under 2 minutes remaining, respecting the
   * 30-day absolute lifetime limit.
   *
   * @returns UpdateSessionResult containing refresh status and metadata
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <it's ok>
  async rotate(): Promise<UpdateSessionResult> {
    try {
      const current = await this.cookie.get();

      if (!current) {
        return { reason: "no_cookie", refreshed: false };
      }

      const decoded = await this.jwt.decode(current);

      if (!decoded?.userId) {
        return { reason: "invalid_or_missing_user", refreshed: false };
      }

      const user = {
        role: decoded.role,
        sessionStart: decoded.sessionStart,
        userId: userIdCodec.decode(decoded.userId),
      };

      const { age, exceeded } = absoluteLifetime(user);

      if (exceeded) {
        await this.cookie.delete();
        this.logger.info(
          "Session not re-issued due to absolute lifetime limit",
          {
            logging: {
              ageMs: age,
              maxMs: MAX_ABSOLUTE_SESSION_MS,
              reason: "absolute_lifetime_exceeded",
              userId: user.userId,
            },
          },
        );
        return {
          ageMs: age,
          maxMs: MAX_ABSOLUTE_SESSION_MS,
          reason: "absolute_lifetime_exceeded",
          refreshed: false,
          userId: user.userId,
        };
      }

      const { refresh, timeLeftMs: remaining } = shouldRefreshToken(decoded);

      if (!refresh) {
        return {
          reason: "not_needed",
          refreshed: false,
          timeLeftMs: remaining,
        };
      }

      const { expiresAtMs, token } = await this.issueToken(
        user,
        decoded.sessionStart,
      );

      await this.cookie.set(token, buildSessionCookieOptions(expiresAtMs));

      this.logger.info("Session token re-issued", {
        logging: {
          expiresAt: expiresAtMs,
          role: user.role,
          userId: user.userId,
        },
      });

      return {
        expiresAt: expiresAtMs,
        reason: "rotated",
        refreshed: true,
        role: user.role,
        userId: user.userId,
      };
    } catch (err: unknown) {
      this.logger.error("Session rotate failed", {
        error: String(err),
        logging: { code: "session_rotate_failed" },
      });

      return { reason: "unexpected_error", refreshed: false };
    }
  }

  /**
   * Issues a new session token with updated expiration.
   *
   * @param user - User with role and id
   * @param sessionStart - Original session start timestamp to preserve
   * @returns Encoded JWT token and expiration timestamp
   */
  private async issueToken(
    user: { role: UserRole; userId: UserId },
    sessionStart: number,
  ): Promise<{ expiresAtMs: number; token: string }> {
    const now = Date.now();

    const expiresAtMs = now + SESSION_DURATION_MS;

    const claims = {
      exp: Math.floor(expiresAtMs / ONE_SECOND_MS),
      expiresAt: expiresAtMs,
      iat: Math.floor(now / ONE_SECOND_MS),
      role: user.role,
      sessionStart,
      userId: user.userId,
    };

    const token = await this.jwt.encode(claims, expiresAtMs);

    return { expiresAtMs, token };
  }
}
