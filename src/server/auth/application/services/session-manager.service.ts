import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type {
  SessionPort,
  SessionTokenCodecPort,
} from "@/server/auth/application/ports/session.port";
import {
  MAX_ABSOLUTE_SESSION_MS,
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
} from "@/server/auth/domain/constants/session.constants";
import { readSessionToken } from "@/server/auth/domain/session/codecs/session-codec";
import { buildSessionCookieOptions } from "@/server/auth/domain/session/config/session-cookie.options";
import type { UpdateSessionResult } from "@/server/auth/domain/session/core/session-update.types";
import {
  absoluteLifetime,
  timeLeftMs,
} from "@/server/auth/domain/session/helpers/session-helpers";
import { userIdCodec } from "@/server/auth/domain/session/validation/session-payload.schema";
import type { UserId } from "@/shared/branding/domain-brands";
import type { BaseError } from "@/shared/errors/core/base-error";
import { normalizeToBaseError } from "@/shared/errors/core/error.utils";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import type { Result } from "@/shared/result/result";
import { Err, Ok } from "@/shared/result/result";

export interface SessionUser {
  readonly id: UserId;
  readonly role: UserRole;
}

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

  async establish(user: SessionUser): Promise<Result<SessionUser, BaseError>> {
    const requestId = crypto.randomUUID();
    try {
      const now = Date.now();
      const expiresAtMs = now + SESSION_DURATION_MS;
      const claims = {
        exp: Math.floor(expiresAtMs / 1000),
        expiresAt: expiresAtMs,
        iat: Math.floor(now / 1000),
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
      const base = normalizeToBaseError(err, "unexpected");
      this.logger.error("Session establish failed", {
        error: String(err),
        logging: { code: "session_establish_failed" },
        requestId,
      });
      return Err(base);
    }
  }

  async clear(): Promise<Result<void, BaseError>> {
    const requestId = crypto.randomUUID();
    try {
      await this.cookie.delete();
      this.logger.info("Session cleared", {
        logging: { context: "SessionManager.clear" },
      });
      return Ok<void>(undefined);
    } catch (err: unknown) {
      const base = normalizeToBaseError(err, "unexpected");
      this.logger.error("Session clear failed", {
        error: String(err),
        logging: { code: "session_clear_failed" },
        requestId,
      });
      return Err(base);
    }
  }

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

  async rotate(): Promise<UpdateSessionResult> {
    try {
      const current = await this.cookie.get();
      if (!current) {
        return { reason: "no_cookie", refreshed: false };
      }
      const payload = await readSessionToken(current);
      const user = payload?.user;
      if (!user?.userId) {
        return { reason: "invalid_or_missing_user", refreshed: false };
      }
      const { exceeded, age } = absoluteLifetime(user);
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
      const remaining = timeLeftMs(payload);
      if (remaining > SESSION_REFRESH_THRESHOLD_MS) {
        this.logger.debug("Session re-issue skipped", {
          logging: { reason: "not_needed", timeLeftMs: remaining },
        });
        return {
          reason: "not_needed",
          refreshed: false,
          timeLeftMs: remaining,
        };
      }
      // Re-issue token using original sessionStart for rolling behavior
      const now = user.sessionStart;
      const expiresAtMs = now + SESSION_DURATION_MS;
      const claims = {
        exp: Math.floor(expiresAtMs / 1000),
        expiresAt: expiresAtMs,
        iat: Math.floor(now / 1000),
        role: user.role,
        sessionStart: now,
        userId: user.userId,
      };
      const token = await this.jwt.encode(claims, expiresAtMs);
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
}
