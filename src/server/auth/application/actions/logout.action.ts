"use server";
import { redirect } from "next/navigation";
import { SessionManager } from "@/server/auth/application/services/session-manager.service";
import { createSessionCookieAdapter } from "@/server/auth/infrastructure/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/server/auth/infrastructure/adapters/session-jwt.adapter";
import { AuthLog, logAuth } from "@/server/auth/logging-auth/auth-log";
import type { BaseError } from "@/shared/errors/core/base-error";
import { logger } from "@/shared/logging/infra/logging.client";

export async function logoutAction(): Promise<void> {
  const requestId = crypto.randomUUID();

  logAuth("info", "Logout action start", AuthLog.action.login.start(), {
    requestId,
  });

  const sessionManager = new SessionManager(
    createSessionCookieAdapter(),
    createSessionJwtAdapter(),
    logger,
  );

  const res = await sessionManager.clear();

  if (res.ok) {
    logAuth("info", "Logout success", AuthLog.action.login.success({}), {
      requestId,
    });
  } else {
    const error: BaseError = res.error;
    logAuth(
      "error",
      "Logout session clear failed",
      AuthLog.action.login.error(error, { reason: "session_clear_failed" }),
      { requestId },
    );
  }

  redirect("/");
}
