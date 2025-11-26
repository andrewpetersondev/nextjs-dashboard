"use server";
import { redirect } from "next/navigation";
import { createSessionManager } from "@/server/auth/application/services/factories/session-manager.factory";
import { AuthLog, logAuth } from "@/server/auth/logging/auth-log";
import type { BaseError } from "@/shared/errors/core/base-error";

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
