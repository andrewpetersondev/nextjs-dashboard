"use server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_PATH } from "@/features/auth/lib/auth.constants";
import type { SessionVerificationResult } from "@/features/auth/sessions/session-payload.types";
import { SessionManager } from "@/server/auth/application/services/session-manager.service";
import { createSessionCookieAdapter } from "@/server/auth/infrastructure/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/server/auth/infrastructure/adapters/session-jwt.adapter";
import { AuthLog, logAuth } from "@/server/auth/logging-auth/auth-log";
import { logger } from "@/shared/logging/infra/logging.client";

/**
 * Verifies the user's session using an optimistic (cookie-based) check.
 */
export const verifySessionOptimistic = cache(
  async (): Promise<SessionVerificationResult> => {
    const sessionManager = new SessionManager(
      createSessionCookieAdapter(),
      createSessionJwtAdapter(),
      logger,
    );
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
