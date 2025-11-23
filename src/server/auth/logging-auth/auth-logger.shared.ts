// src/server/auth/logging/auth-logger.shared.ts
import "server-only";
import type { AuthLogPayload } from "@/server/auth/logging-auth/auth-logging.types";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import type { LogEventContext } from "@/shared/logging/core/logger.types";
import { logger as rootLogger } from "@/shared/logging/infra/logging.client";

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
  bindings?: Record<string, unknown>,
): LoggingClientContract {
  let base = authLogger.withContext(scope);

  if (requestId) {
    base = base.withRequest(requestId);
  }

  if (bindings) {
    base = base.child(bindings);
  }

  return base;
}

/**
 * Helper to log an auth error using the optimal `errorWithDetails` pattern.
 *
 * It extracts the `error` object from the standardized factory payload.
 * It then separates operational context (safe for LogEventContext) from
 * auth-specific metadata (layer, kind) which conflicts with BaseError reserved keys.
 */
export function logAuthError(
  logger: LoggingClientContract,
  message: string,
  payload: AuthLogPayload,
): void {
  const { error, ...rest } = payload;

  // 1. Build the LogEventContext (Operational metadata)
  // We can now safely spread all auth metadata into the 'log' object
  // because the error is isolated in the 'error' root key.
  const loggingContext: LogEventContext = {
    ...rest,
  };

  logger.errorWithDetails(message, error, loggingContext);
}
