// src/server/auth/logging/auth-logger.shared.ts
import "server-only";
import {
  type LoggingClient,
  logger as rootLogger,
} from "@/shared/logging/logger.shared";

/**
 * Base logger for all auth-related logs.
 *
 * Every auth log will have a context prefix of `auth`.
 */
export const authLogger = rootLogger.withContext("auth");

/**
 * Create a scoped auth logger with a hierarchical context and optional requestId.
 *
 * Examples:
 * - createAuthLogger("action.login")
 * - createAuthLogger("service.signup", requestId)
 * - createAuthLogger("infrastructure.dal.insertUser")
 */
export function createAuthLogger(
  scope: string,
  requestId?: string,
): LoggingClient {
  const base = authLogger.withContext(scope);
  return requestId ? base.withRequest(requestId) : base;
}
