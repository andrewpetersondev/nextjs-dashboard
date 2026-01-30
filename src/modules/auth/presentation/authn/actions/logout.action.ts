"use server";
import { redirect } from "next/navigation";
import { logoutWorkflow } from "@/modules/auth/application/session/workflows/logout.workflow";
import { sessionServiceFactory } from "@/modules/auth/infrastructure/session/factories/session-service.factory";
import { getRequestMetadata } from "@/shared/http/request-metadata";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Next.js Server Action for user logout.
 *
 * @remarks
 * This action terminates the user's session by:
 * 1. Initializing the {@link sessionServiceFactory}.
 * 2. Executing the {@link logoutWorkflow} to clear session data (e.g., cookies).
 * 3. Logging the outcome of the logout process.
 * 4. Redirecting the user to the landing page.
 *
 * @returns A promise that resolves when the logout process is complete.
 * @redirects {"/"} always.
 */
export async function logoutAction(): Promise<void> {
  const requestId = crypto.randomUUID();
  const { ip, userAgent } = await getRequestMetadata();

  const logger = defaultLogger
    .withContext("auth:action")
    .withRequest(requestId)
    .child({ ip, userAgent });

  logger.operation("info", "Logout action start", {
    operationContext: "authentication",
    operationIdentifiers: { ip },
    operationName: "logout.start",
  });

  const sessionService = sessionServiceFactory(logger, requestId);

  const res = await logoutWorkflow({ sessionService });

  if (res.ok) {
    logger.operation("info", "Logout success", {
      operationContext: "authentication",
      operationIdentifiers: { ip },
      operationName: "logout.success",
    });
  } else {
    logger.errorWithDetails("Logout session clear failed", res.error, {
      operationContext: "authentication",
      operationIdentifiers: { ip, reason: "session_clear_failed" },
      operationName: "logout.failed",
    });
  }

  redirect("/");
}
