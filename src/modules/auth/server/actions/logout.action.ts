"use server";

import { redirect } from "next/navigation";
import { createSessionServiceFactory } from "@/modules/auth/server/application/services/factories/session-service.factory";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

export async function logoutAction(): Promise<void> {
  const requestId = crypto.randomUUID();

  const logger = defaultLogger
    .withContext("auth:action")
    .withRequest(requestId);

  logger.operation("info", "Logout action start", {
    operationName: "logout.start",
  });

  const sessionManager = createSessionServiceFactory();

  const res = await sessionManager.clear();

  if (res.ok) {
    logger.operation("info", "Logout success", {
      operationName: "logout.success",
    });
  } else {
    const error = res.error;
    logger.operation("error", "Logout session clear failed", {
      error,
      operationIdentifiers: { reason: "session_clear_failed" },
      operationName: "logout.failed",
    });
  }

  redirect("/");
}
