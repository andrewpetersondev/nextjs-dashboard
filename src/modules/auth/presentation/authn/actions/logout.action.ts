"use server";
import { redirect } from "next/navigation";
import { logoutWorkflow } from "@/modules/auth/application/session/workflows/logout.workflow";
import { makeAuthComposition } from "@/modules/auth/infrastructure/composition/auth.composition";

/**
 * Next.js Server Action for user logout.
 *
 * @remarks
 * This action terminates the user's session by:
 * 1. Building the auth composition (request-scoped logger + session service).
 * 2. Executing the {@link logoutWorkflow} to clear session data (e.g., cookies).
 * 3. Logging the outcome of the logout process.
 * 4. Redirecting the user to the landing page.
 *
 * @returns A promise that resolves when the logout process is complete.
 * @redirects {"/"} always.
 */
export async function logoutAction(): Promise<void> {
  const auth = await makeAuthComposition();
  const { ip } = auth.request;

  const logger = auth.loggers.action;

  logger.operation("info", "Logout action start", {
    operationContext: "authentication",
    operationIdentifiers: { ip },
    operationName: "logout.start",
  });

  const res = await logoutWorkflow({
    sessionService: auth.services.sessionService,
  });

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
