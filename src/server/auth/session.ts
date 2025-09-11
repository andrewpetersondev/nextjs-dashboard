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
  const expiresAt: number = Date.now() + SESSION_DURATION_MS;
  const newToken: string = await createSessionToken({
    user: { expiresAt, role: user.role, userId: user.userId },
  });
  cookieStore.set(SESSION_COOKIE_NAME, newToken, {
    expires: new Date(expiresAt),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  serverLogger.info(
    {
      context: "updateSession",
      expiresAt,
      role: user.role,
      userId: user.userId,
    },
    "Session token re-issued",
  );
}
