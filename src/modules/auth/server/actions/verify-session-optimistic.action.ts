"use server";

import { redirect } from "next/navigation";
import { cache } from "react";
import type { SessionVerificationResult } from "@/modules/auth/domain/session/session-payload.types";
import { createSessionServiceFactory } from "@/modules/auth/server/application/services/factories/session-service.factory";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Verifies the user's session using an optimistic (cookie-based) check.
 */
export const verifySessionOptimistic = cache(
  async (): Promise<SessionVerificationResult> => {
    const logger = defaultLogger.withContext("auth:action");

    const sessionManager = createSessionServiceFactory();
    const session = await sessionManager.read();
    if (!session?.userId) {
      logger.operation("warn", "No valid session found", {
        operationIdentifiers: { reason: "no_session" },
        operationName: "session.verifyOptimistic.noSession",
      });

      redirect(ROUTES.auth.login);
    }

    logger.operation("info", "Session verified (optimistic)", {
      operationIdentifiers: { role: session.role, userId: session.userId },
      operationName: "session.verifyOptimistic.success",
    });

    return {
      isAuthorized: true,
      role: session.role,
      userId: session.userId,
    };
  },
);
