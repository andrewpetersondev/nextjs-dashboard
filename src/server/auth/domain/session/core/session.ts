import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import {
  MAX_ABSOLUTE_SESSION_MS,
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
} from "@/server/auth/domain/constants/session.constants";
import {
  createSessionToken,
  readSessionToken,
} from "@/server/auth/domain/session/codecs/session-codec";
import { buildSessionCookieOptions } from "@/server/auth/domain/session/config/session-cookie.options";
import type { DecryptPayload } from "@/server/auth/domain/session/core/session-payload.types";
import type { UpdateSessionResult } from "@/server/auth/domain/session/core/session-update.types";
import {
  absoluteLifetime,
  timeLeftMs,
} from "@/server/auth/domain/session/helpers/session-helpers";
import { sessionCookieAdapter } from "@/server/auth/infrastructure/adapters/session-cookie.adapter";
import type { UserId } from "@/shared/branding/domain-brands";
import { logger } from "@/shared/logging/infra/logging.client";

function buildSessionJwtPayload(params: {
  readonly userId: UserId;
  readonly role: UserRole;
  readonly now?: number;
}) {
  const now = params.now ?? Date.now();
  const expiresAt = now + SESSION_DURATION_MS;
  return {
    expiresAt,
    payload: {
      user: {
        expiresAt,
        role: params.role,
        sessionStart: now,
        userId: params.userId,
      },
    },
  };
}

async function rotateSession(user: {
  readonly userId: UserId;
  readonly role: UserRole;
  readonly sessionStart: number;
}): Promise<UpdateSessionResult> {
  const { payload, expiresAt } = buildSessionJwtPayload({
    now: user.sessionStart,
    role: user.role,
    userId: user.userId,
  });

  const token = await createSessionToken(payload);
  await sessionCookieAdapter.set(token, buildSessionCookieOptions(expiresAt));

  logger.info("Session token re-issued", {
    logging: {
      expiresAt,
      role: user.role,
      userId: user.userId,
    },
  });

  return {
    expiresAt,
    reason: "rotated",
    refreshed: true,
    role: user.role,
    userId: user.userId,
  };
}

export async function deleteSessionToken(): Promise<void> {
  await sessionCookieAdapter.delete();
}

export async function setSessionToken(
  userId: UserId,
  role: UserRole,
): Promise<void> {
  const { payload, expiresAt } = buildSessionJwtPayload({ role, userId });
  const session = await createSessionToken(payload);

  await sessionCookieAdapter.set(session, buildSessionCookieOptions(expiresAt));

  logger.info(`Session created for user ${userId} with role ${role}`, {
    logging: { expiresAt, role, userId },
  });
}

export async function updateSessionToken(): Promise<UpdateSessionResult> {
  const current = await sessionCookieAdapter.get();
  if (!current) {
    return { reason: "no_cookie", refreshed: false };
  }

  const payload: DecryptPayload | undefined = await readSessionToken(current);
  const user = payload?.user;
  if (!user?.userId) {
    return { reason: "invalid_or_missing_user", refreshed: false };
  }

  const { exceeded, age } = absoluteLifetime(user);
  if (exceeded) {
    await sessionCookieAdapter.delete();
    logger.info("Session not re-issued due to absolute lifetime limit", {
      logging: {
        ageMs: age,
        maxMs: MAX_ABSOLUTE_SESSION_MS,
        reason: "absolute_lifetime_exceeded",
        userId: user.userId,
      },
    });
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
    logger.debug("Session re-issue skipped", {
      logging: {
        reason: "not_needed",
        timeLeftMs: remaining,
      },
    });
    return { reason: "not_needed", refreshed: false, timeLeftMs: remaining };
  }

  return rotateSession({
    role: user.role,
    sessionStart: user.sessionStart,
    userId: user.userId,
  });
}
