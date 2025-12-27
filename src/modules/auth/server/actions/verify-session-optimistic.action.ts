"use server";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createSessionServiceFactory } from "@/modules/auth/server/application/factories/session-service.factory";
import { verifySessionOptimisticWorkflow } from "@/modules/auth/server/application/workflows/verify-session-optimistic.workflow";
import type { SessionTransport } from "@/modules/auth/shared/types/transport/session.transport";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Verifies the user's session using an optimistic (cookie-based) check.
 *
 * Boundary responsibilities:
 * - caching (React)
 * - redirecting (Next.js)
 * - logging
 */
export const verifySessionOptimistic = cache(
  async (): Promise<SessionTransport> => {
    const requestId = crypto.randomUUID();

    const logger = defaultLogger
      .withContext("auth:action")
      .withRequest(requestId);

    const sessionService = createSessionServiceFactory(logger, requestId);

    const res = await verifySessionOptimisticWorkflow({ sessionService });

    if (!res.ok) {
      logger.operation("warn", "No valid session found", {
        operationContext: "authentication",
        operationIdentifiers: { reason: res.error.reason },
        operationName: "session.verifyOptimistic.noSession",
      });

      redirect(ROUTES.auth.login);
    }

    logger.operation("info", "Session verified (optimistic)", {
      operationContext: "authentication",
      operationIdentifiers: { role: res.value.role, userId: res.value.userId },
      operationName: "session.verifyOptimistic.success",
    });

    return res.value;
  },
);
