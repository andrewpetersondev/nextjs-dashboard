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
import { SESSION_DURATION_MS } from "@/shared/auth/sessions/constants";
import type { SessionVerificationResult } from "@/shared/auth/sessions/zod";
import type { AuthRole } from "@/shared/auth/types";

/**
 * Deletes the session cookie.
 */
export async function deleteSessionToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  serverLogger.info({ context: "deleteSession" }, "Session cookie deleted");
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
  cookieStore.set(SESSION_COOKIE_NAME, session, {
    expires: new Date(expiresAt),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  serverLogger.info(
    { context: "createSession", expiresAt, role, userId },
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

export async function _updateSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!session) {
    return;
  }
  const payload = await readSessionToken(session);
  if (!payload) {
    return;
  }
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  cookieStore.set(SESSION_COOKIE_NAME, session, {
    expires: new Date(expiresAt),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

// /**
//  * Updates the session cookie's expiration if valid.
//  * @returns {Promise<null | void>} Null if session is missing/expired, otherwise void.
//  */
// async function _updateSessionToken(): Promise<null | void> {
//   const cookieStore = await cookies();
//   const rawCookie = cookieStore.get(SESSION_COOKIE_NAME);
//   const session = getCookieValue(rawCookie?.value);
//   if (!session) { return null; }
//   const payload = await readSessionToken(session);
//   if (!payload?.user) { return null; }
//   const now = Date.now();
//   const expiration = new Date(payload.user.expiresAt).getTime();
//   if (now > expiration) { return null; }
//   const { user } = payload;
//   const newExpiration = new Date(expiration + ONE_DAY_MS).getTime();
//   const minimalPayload: EncryptPayload = {
//     user: {
//       expiresAt: newExpiration,
//       role: user.role,
//       userId: user.userId,
//     },
//   };
//   const updatedToken = await createSessionToken(minimalPayload);
//   cookieStore.set(SESSION_COOKIE_NAME, updatedToken, {
//     expires: new Date(newExpiration),
//     httpOnly: true,
//     path: "/",
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//   });
// }
