"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_PATH } from "@/features/auth/lib/auth.constants";
import type { SessionVerificationResult } from "@/features/auth/sessions/session-payload.types";
import { SESSION_COOKIE_NAME } from "@/server/auth/domain/constants/session.constants";
import { readSessionToken } from "@/server/auth/domain/session/codecs/session-codec";
import type { DecryptPayload } from "@/server/auth/domain/session/core/session-payload.types";
import { serverLogger } from "@/server/logging/serverLogger";

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
