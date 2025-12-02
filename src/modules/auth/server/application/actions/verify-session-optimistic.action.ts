"use server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_PATH } from "@/modules/auth/domain/auth.constants";
import { AuthLog, logAuth } from "@/modules/auth/domain/logging/auth-log";
import type { SessionVerificationResult } from "@/modules/auth/domain/sessions/session-payload.types";
import { createSessionManager } from "@/modules/auth/server/application/services/factories/session-manager.factory";

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
