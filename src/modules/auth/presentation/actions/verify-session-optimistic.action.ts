"use server";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { SessionVerificationDto } from "@/modules/auth/application/dtos/session-verification.dto";
import { verifySessionOptimisticWorkflow } from "@/modules/auth/application/session/verify-session-optimistic.workflow";
import { sessionServiceFactory } from "@/modules/auth/infrastructure/session/factories/session-service.factory";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Verifies the user's session using an optimistic (cookie-based) check.
 *
 * @remarks
 * This function is cached using React's `cache` to prevent redundant checks
 * within the same render pass. It is typically used in Server Components
 * to ensure a user is authenticated before rendering protected content.
 *
 * Responsibilities:
 * - Executes the {@link verifySessionOptimisticWorkflow}.
 * - Redirects to the login page if no valid session is found.
 * - Logs the outcome of the verification.
 * - Provides optimistic session data (role, userId) on success.
 *
 * @returns A promise resolving to the {@link SessionVerificationDto}.
 * @redirects {ROUTES.auth.login} if the session is invalid or missing.
 */
export const verifySessionOptimistic = cache(
  async (): Promise<SessionVerificationDto> => {
    const requestId = crypto.randomUUID();

    const logger = defaultLogger
      .withContext("auth:action")
      .withRequest(requestId);

    const sessionService = sessionServiceFactory(logger, requestId);

    const res = await verifySessionOptimisticWorkflow({ sessionService });

    if (!res.ok) {
      logger.operation("warn", "No valid session found", {
        operationContext: "authentication",
        operationIdentifiers: { reason: res.error.description },
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
