"use server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_PATH } from "@/features/auth/lib/auth.constants";
import type { SessionVerificationResult } from "@/features/auth/sessions/session-payload.types";
import { createSessionManager } from "@/server/auth/application/services/factories/session-manager.factory";
import { AuthLog, logAuth } from "@/server/auth/logging/auth-log";

/**
 * Verifies the user's session using an optimistic (cookie-based) check.
 */
export const verifySessionOptimistic = cache(
  async (): Promise<SessionVerificationResult> => {
    const sessionManager = createSessionManager();
    const session = await sessionManager.read();
    if (!session?.userId) {
      logAuth(
        "warn",
        "No valid session found",
        AuthLog.action.login.failure(),
        { additionalData: { reason: "no_session" } },
      );
      redirect(LOGIN_PATH);
    }
    return {
      isAuthorized: true,
      role: session.role,
      userId: session.userId,
    };
  },
);
