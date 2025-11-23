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
  const {
    error,
    // These keys conflict with BaseErrorLogPayload (ReservedKeyBlocker)
    // or are specific to AuthLogPayload
    layer,
    kind,
    details,
    errorSource,
    operationIdentifiers,
    operationName,
    operationContext,
    ...rest
  } = payload;

  // 1. Build the LogEventContext (Operational metadata)
  const loggingContext: LogEventContext = {
    ...rest, // e.g. correlationId
    // We pass these explicitly if they exist, as they are not reserved
    ...(operationContext ? { operationContext } : {}),
  };

  // 2. Build a metadata object for the auth specifics
  //    This ensures we don't lose 'layer' or 'errorSource' info
  //    even if the error object itself doesn't have them.
  const authMetadata = {
    details,
    errorSource,
    identifiers: operationIdentifiers,
    kind,
    layer,
    operationName,
  };

  // 3. Merge authMetadata into loggingContext under a specific key
  //    to avoid collision with reserved keys like 'layer'.
  const safeContext: LogEventContext = {
    ...loggingContext,
    auth: authMetadata,
  };

  logger.errorWithDetails(message, error, safeContext);
}
