"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_PATH } from "@/features/auth/lib/auth.constants";
import type { SessionVerificationResult } from "@/features/auth/sessions/session-payload.types";
import { SESSION_COOKIE_NAME } from "@/server/auth/domain/constants/session.constants";
import { readSessionToken } from "@/server/auth/domain/session/codecs/session-codec";
import type { DecryptPayload } from "@/server/auth/domain/session/core/session-payload.types";
import { AuthLog, logAuth } from "@/server/auth/logging-auth/auth-log";

/**
 * Verifies the user's session using an optimistic (cookie-based) check.
 */
export const verifySessionOptimistic = cache(
  async (): Promise<SessionVerificationResult> => {
    try {
      const cookie: string | undefined = (await cookies()).get(
        SESSION_COOKIE_NAME,
      )?.value;
      if (!cookie) {
        logAuth(
          "warn",
          "No session cookie found",
          AuthLog.action.login.failure(),
          { additionalData: { reason: "no_session_cookie" } },
        );
        redirect(LOGIN_PATH);
      }
      const session: DecryptPayload | undefined =
        await readSessionToken(cookie);
      if (!session?.user?.userId) {
        logAuth(
          "warn",
          "Invalid session or missing user information",
          AuthLog.action.login.failure(),
          { additionalData: { reason: "invalid_session" } },
        );
        redirect(LOGIN_PATH);
      }
      return {
        isAuthorized: true,
        role: session.user.role,
        userId: session.user.userId,
      };
    } finally {
      // No cleanup needed currently
    }
  },
);
