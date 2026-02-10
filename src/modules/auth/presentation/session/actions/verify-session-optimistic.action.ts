"use server";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { SessionVerificationDto } from "@/modules/auth/application/session/dtos/responses/session-verification.dto";
import { makeAuthComposition } from "@/modules/auth/infrastructure/composition/auth.composition";
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
 * - Verifies the session via {@link SessionServiceContract}.
 * - Redirects to the login page if no valid session is found.
 * - Logs the outcome of the verification.
 * - Provides optimistic session data (role, userId) on success.
 *
 * @returns A promise resolving to the {@link SessionVerificationDto}.
 * @redirects {ROUTES.auth.login} if the session is invalid or missing.
 */
// biome-ignore lint/nursery/useExplicitType: fix later
export const verifySessionOptimistic = cache(
  async (): Promise<SessionVerificationDto> => {
    const auth = await makeAuthComposition();
    const logger = auth.loggers.action;
    const sessionService = auth.services.sessionService;

    const res = await sessionService.verify();

    if (!res.ok) {
      logger.operation("warn", "No valid session found", {
        operationContext: "authentication",
        operationIdentifiers: { reason: res.error.definitionDescription },
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
