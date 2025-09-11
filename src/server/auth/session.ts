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
  ONE_SECOND_MS,
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
  THIRTY_DAYS_MS,
} from "@/shared/auth/sessions/constants";
import type { SessionVerificationResult } from "@/shared/auth/sessions/zod";
import type { AuthRole } from "@/shared/auth/types";

// Absolute max lifetime for a session regardless of rolling refreshes (default: 30 days)
const MAX_ABSOLUTE_SESSION_MS = THIRTY_DAYS_MS; // 30d
const ROLLING_COOKIE_MAX_AGE_S = Math.floor(
  SESSION_DURATION_MS / ONE_SECOND_MS,
);

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
  const expiresAt: number = Date.now() + SESSION_DURATION_MS;
  const session: string = await createSessionToken({
    user: { expiresAt, role, userId },
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
 */
export async function updateSessionToken(): Promise<void> {
  const cookieStore = await cookies();
  const current: string | undefined =
    cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!current) {
    return;
  }
  const payload: DecryptPayload | undefined = await readSessionToken(current);
  const user = payload?.user;
  if (!user?.userId) {
    return;
  }
  const issuedAtSec: number = payload?.iat ?? 0;
  const ageMs = issuedAtSec
    ? Date.now() - issuedAtSec * ONE_SECOND_MS
    : Number.POSITIVE_INFINITY;
  if (!issuedAtSec || ageMs > MAX_ABSOLUTE_SESSION_MS) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    serverLogger.info(
      {
        ageMs,
        context: "updateSessionToken",
        maxMs: MAX_ABSOLUTE_SESSION_MS,
        reason: "absolute_lifetime_exceeded",
        userId: user.userId,
      },
      "Session not re-issued due to absolute lifetime limit; cookie deleted",
    );
    return;
  }
  // Skip refresh if there is sufficient time left before expiration
  const expSec: number = payload?.exp ?? 0;
  const timeLeftMs = expSec ? expSec * ONE_SECOND_MS - Date.now() : 0;
  if (timeLeftMs > SESSION_REFRESH_THRESHOLD_MS) {
    serverLogger.debug(
      { context: "updateSessionToken", reason: "not_needed", timeLeftMs },
      "Session re-issue skipped; sufficient time remaining",
    );
    return;
  }
  const expiresAt: number = Date.now() + SESSION_DURATION_MS;
  const newToken: string = await createSessionToken({
    user: { expiresAt, role: user.role, userId: user.userId },
  });
  cookieStore.set(
    SESSION_COOKIE_NAME,
    newToken,
    buildSessionCookieOptions(expiresAt),
  );
  serverLogger.info(
    {
      context: "updateSessionToken",
      expiresAt,
      role: user.role,
      userId: user.userId,
    },
    "Session token re-issued",
  );
}
