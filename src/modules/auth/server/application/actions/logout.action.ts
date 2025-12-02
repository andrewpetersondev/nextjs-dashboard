"use server";
import { redirect } from "next/navigation";
import { AuthLog, logAuth } from "@/modules/auth/domain/logging/auth-log";
import { createSessionManager } from "@/modules/auth/server/application/services/factories/session-manager.factory";
import type { AppError } from "@/shared/errors/core/app-error.class";

export async function logoutAction(): Promise<void> {
  const requestId = crypto.randomUUID();

  logAuth("info", "Logout action start", AuthLog.action.login.start(), {
    requestId,
  });

  const sessionManager = createSessionManager();

  const res = await sessionManager.clear();

  if (res.ok) {
    logAuth("info", "Logout success", AuthLog.action.login.success({}), {
      requestId,
    });
  } else {
    const error: AppError = res.error;
    logAuth(
      "error",
      "Logout session clear failed",
      AuthLog.action.login.error(error, { reason: "session_clear_failed" }),
      { requestId },
    );
  }

  redirect("/");
}
