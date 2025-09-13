/** biome-ignore-all lint/style/noProcessEnv: <fix later> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <fix later> */
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_COOKIE_NAME } from "@/server/auth/constants";
import {
  createSessionToken,
  readSessionToken,
} from "@/server/auth/session-codec";
import type { DecryptPayload } from "@/server/auth/types";
import { serverLogger } from "@/server/logging/serverLogger";
import { LOGIN_PATH } from "@/shared/auth/constants";
import {
  MAX_ABSOLUTE_SESSION_MS,
  ONE_SECOND_MS,
  ROLLING_COOKIE_MAX_AGE_S,
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
} from "@/shared/auth/sessions/constants";
import type { SessionVerificationResult } from "@/shared/auth/sessions/zod";
import type { AuthRole } from "@/shared/auth/types";

// Build standard cookie options to avoid duplication
const buildSessionCookieOptions = (expiresAtMs: number) => ({
  expires: new Date(expiresAtMs),
  httpOnly: true,
  maxAge: ROLLING_COOKIE_MAX_AGE_S,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
});

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
  userId: string,
  role: AuthRole = "user",
): Promise<void> {
  const now = Date.now();
  const expiresAt: number = now + SESSION_DURATION_MS;
  const session: string = await createSessionToken({
    user: { expiresAt, role, sessionStart: now, userId },
  });
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
 * Verifies the user's session using an optimistic (cookie-based) check.
 */
export const verifySessionOptimistic = cache(
  async (): Promise<SessionVerificationResult> => {
    const cookie: string | undefined = (await cookies()).get(
      SESSION_COOKIE_NAME,
    )?.value;
    if (!cookie) {
      serverLogger.warn(
        { context: "verifySessionOptimistic" },
        "No session cookie found",
      );
      redirect(LOGIN_PATH);
    }
    const session: DecryptPayload | undefined = await readSessionToken(cookie);
    if (!session?.user?.userId) {
      serverLogger.warn(
        { context: "verifySessionOptimistic" },
        "Invalid session or missing user information",
      );
      redirect(LOGIN_PATH);
    }
    return {
      isAuthorized: true,
      role: session.user.role,
      userId: session.user.userId,
    };
  },
);

/**
 * Re-issues the session JWT and updates the cookie if the current token is valid.
 * Must be called from server actions or route handlers.
 * Returns a structured outcome describing what occurred.
 */
export type UpdateSessionResult =
  | { readonly refreshed: false; readonly reason: "no_cookie" }
  | { readonly refreshed: false; readonly reason: "invalid_or_missing_user" }
  | {
      readonly refreshed: false;
      readonly reason: "absolute_lifetime_exceeded";
      readonly ageMs: number;
      readonly maxMs: number;
      readonly userId?: string;
    }
  | {
      readonly refreshed: false;
      readonly reason: "not_needed";
      readonly timeLeftMs: number;
    }
  | {
      readonly refreshed: true;
      readonly reason: "rotated";
      readonly expiresAt: number;
      readonly userId: string;
      readonly role: string;
    };

/**
 * Re-issues the session JWT and updates the cookie if the current token is valid.
 * Must be called from server actions or route handlers.
 */

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
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

  const start = user.sessionStart;
  const age = Date.now() - start;
  if (!start || age > MAX_ABSOLUTE_SESSION_MS) {
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

  const expMs = (payload?.exp ?? 0) * ONE_SECOND_MS;
  const timeLeftMs = expMs - Date.now();
  if (timeLeftMs > SESSION_REFRESH_THRESHOLD_MS) {
    serverLogger.debug(
      { context: "updateSessionToken", reason: "not_needed", timeLeftMs },
      "Session re-issue skipped; sufficient time remaining",
    );
    return { reason: "not_needed", refreshed: false, timeLeftMs };
  }

  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const token = await createSessionToken({
    user: {
      expiresAt,
      role: user.role,
      sessionStart: start,
      userId: user.userId,
    },
  });
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
    role: String(user.role),
    userId: user.userId,
  };
}
