"use server";
import type { SessionUser } from "@/modules/auth/domain/sessions/session-action.types";
import { createSessionManagerFactory } from "@/modules/auth/server/application/services/factories/session-manager.factory";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Establishes a session for a user by setting `jwt cookie`.
 *
 * @param user - The user object containing `id` and `role`.
 *
 * @returns A promise that resolves to a Result indicating the success or failure of the session establishment.
 */
export async function establishSessionAction(
  user: SessionUser,
): Promise<Result<SessionUser, AppError>> {
  const requestId = crypto.randomUUID();

  const logger = defaultLogger
    .withContext("auth:action")
    .withRequest(requestId)
    .child({ role: user.role, userId: user.id });

  logger.operation("info", "Establish session start", {
    operationName: "session.establish.start",
  });

  const sessionManager = createSessionManagerFactory();

  const res = await sessionManager.establish(user);

  if (res.ok) {
    logger.operation("info", "Session established successfully", {
      operationName: "session.establish.success",
    });
    return Ok(user);
  }

  const error = res.error;

  logger.operation("error", "Failed to establish session", {
    error,
    operationName: "session.establish.failed",
  });

  return Err<AppError>(error);
}
