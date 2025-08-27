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
import { SESSION_DURATION_MS } from "@/shared/auth/constants";
import type { AuthRole } from "@/shared/auth/roles";
import type { SessionVerificationResult } from "@/shared/auth/types";

/**
 * Deletes the session cookie.
 * @returns {Promise<void>}
 */
export async function deleteSessionToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  serverLogger.info({ context: "deleteSession" }, "Session cookie deleted");
}

/**
 * Creates a new session cookie for the user.
 * @param userId - The user's unique identifier.
 * @param role - The user's role.
 * @returns {Promise<void>}
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
 *
 * - Reads the session cookie and attempts to readSessionToken it.
 * - Validates the presence of user information in the session.
 * - Redirects to `/login` if the session is missing or invalid.
 * - Returns an object containing authorization status, user ID, and role.
 */
export const verifySessionOptimistic = cache(
  async (): Promise<SessionVerificationResult> => {
    const cookie: string | undefined = (await cookies()).get(
      SESSION_COOKIE_NAME,
    )?.value;
    if (!cookie) {
      console.error("No session cookie found");
      redirect("/login");
    }
    const session: DecryptPayload | undefined = await readSessionToken(cookie);
    if (!session?.user?.userId) {
      console.error("Invalid session or missing user information");
      redirect("/login");
    }
    return {
      isAuthorized: true,
      role: session.user.role,
      userId: session.user.userId,
    };
  },
);

// /**
//  * Updates the session cookie's expiration if valid.
//  * @returns {Promise<null | void>} Null if session is missing/expired, otherwise void.
//  */
// async function _updateSessionToken(): Promise<null | void> {
//   const cookieStore = await cookies();
//
//   const rawCookie = cookieStore.get(SESSION_COOKIE_NAME);
//
//   const session = getCookieValue(rawCookie?.value);
//
//   if (!session) {
//     logger.warn(
//       { context: "updateSession" },
//       "No session cookie found to update",
//     );
//     return null;
//   }
//
//   const payload = await readSessionToken(session);
//
//   if (!payload?.user) {
//     logger.warn(
//       { context: "updateSession" },
//       "Session payload invalid or missing user",
//     );
//     return null;
//   }
//
//   const now = Date.now();
//
//   const expiration = new Date(payload.user.expiresAt).getTime();
//
//   if (now > expiration) {
//     logger.info(
//       { context: "updateSession", userId: payload.user.userId },
//       "Session expired, not updating",
//     );
//     return null;
//   }
//
//   const { user } = payload;
//   const newExpiration = new Date(expiration + ONE_DAY_MS).getTime();
//
//   const minimalPayload: EncryptPayload = {
//     user: {
//       expiresAt: newExpiration,
//       role: user.role,
//       userId: user.userId,
//     },
//   };
//
//   const updatedToken = await createSessionToken(minimalPayload);
//
//   cookieStore.set(SESSION_COOKIE_NAME, updatedToken, {
//     expires: new Date(newExpiration),
//     httpOnly: true,
//     path: "/",
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//   });
//
//   logger.info(
//     { context: "updateSession", newExpiration, userId: user.userId },
//     "Session updated with new expiration",
//   );
// }
