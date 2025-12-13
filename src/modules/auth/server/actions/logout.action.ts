"use server";

import { redirect } from "next/navigation";
import { createSessionServiceFactory } from "@/modules/auth/server/application/services/factories/session-service.factory";
import { logoutWorkflow } from "@/modules/auth/server/application/workflows/logout.workflow";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

export async function logoutAction(): Promise<void> {
  const requestId = crypto.randomUUID();

  const logger = defaultLogger
    .withContext("auth:action")
    .withRequest(requestId);

  logger.operation("info", "Logout action start", {
    operationName: "logout.start",
  });

  const sessionService = createSessionServiceFactory(logger);

  const res = await logoutWorkflow({ sessionService });

  if (res.ok) {
    logger.operation("info", "Logout success", {
      operationName: "logout.success",
    });
  } else {
    logger.operation("error", "Logout session clear failed", {
      error: res.error,
      operationIdentifiers: { reason: "session_clear_failed" },
      operationName: "logout.failed",
    });
  }

  redirect("/");
}
