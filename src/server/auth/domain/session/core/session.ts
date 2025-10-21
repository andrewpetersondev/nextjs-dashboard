import "server-only";
import { cookies } from "next/headers";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import {
  MAX_ABSOLUTE_SESSION_MS,
  SESSION_COOKIE_NAME,
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
import { serverLogger } from "@/server/logging/serverLogger";
import type { UserId } from "@/shared/domain/domain-brands";

// Small, testable builder for the JWT payload.
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

/** Internal: rotate session and persist cookie. */
async function rotateSession(
  store: Awaited<ReturnType<typeof cookies>>,
  user: {
    readonly userId: UserId;
    readonly role: UserRole;
    readonly sessionStart: number;
  },
): Promise<UpdateSessionResult> {
  const { payload, expiresAt } = buildSessionJwtPayload({
    now: user.sessionStart, // keep original sessionStart stable
    role: user.role,
    userId: user.userId,
  });
  const token = await createSessionToken(payload);
  store.set(SESSION_COOKIE_NAME, token, buildSessionCookieOptions(expiresAt));
  serverLogger.info(
    {
      context: "updateSessionToken",
      expiresAt,
      role: user.role,
      userId: user.userId,
    },
    "Session token re-issued",
  );
  return {
    expiresAt,
    reason: "rotated",
    refreshed: true,
    role: user.role,
    userId: user.userId,
  };
}

/**
 * Deletes the session cookie.
 */
export async function deleteSessionToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  serverLogger.info(
    { context: "deleteSessionToken" },
    "Session cookie deleted",
  );
}

/**
 * Creates a new session cookie for the user.
 */
export async function setSessionToken(
  userId: UserId,
  role: UserRole,
): Promise<void> {
  const { payload, expiresAt } = buildSessionJwtPayload({ role, userId });
  const session = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    session,
    buildSessionCookieOptions(expiresAt),
  );
  serverLogger.info(
    { context: "setSessionToken", expiresAt, role, userId },
    `Session created for user ${userId} with role ${role}`,
  );
}

/**
 * Re-issues the session JWT and updates the cookie if the current token is valid.
 * Must be called from server actions or route handlers.
 */
export async function updateSessionToken(): Promise<UpdateSessionResult> {
  const store = await cookies();
  const current = store.get(SESSION_COOKIE_NAME)?.value;
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
    store.delete(SESSION_COOKIE_NAME);
    serverLogger.info(
      {
        ageMs: age,
        context: "updateSessionToken",
        maxMs: MAX_ABSOLUTE_SESSION_MS,
        reason: "absolute_lifetime_exceeded",
        userId: user.userId,
      },
      "Session not re-issued due to absolute lifetime limit; cookie deleted",
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
    serverLogger.debug(
      {
        context: "updateSessionToken",
        reason: "not_needed",
        timeLeftMs: remaining,
      },
      "Session re-issue skipped; sufficient time remaining",
    );
    return { reason: "not_needed", refreshed: false, timeLeftMs: remaining };
  }

  return rotateSession(store, {
    role: user.role,
    sessionStart: user.sessionStart,
    userId: user.userId,
  });
}
