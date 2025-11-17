// src/server/auth/logging/auth-logger.shared.ts
import "server-only";
import {
  type AuthLayerContext,
  toErrorContext,
} from "@/server/auth/logging/auth-layer-context";
import type {
  AuthErrorSource,
  AuthLogKind,
  AuthLogLayer,
  AuthLogPayload,
} from "@/server/auth/logging/auth-logging.types";
import {
  type Logger,
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
export function createAuthLogger(scope: string, requestId?: string): Logger {
  const base = authLogger.withContext(scope);
  return requestId ? base.withRequest(requestId) : base;
}

/**
 * Centralized helper for logging auth errors with a consistent payload shape.
 *
 * Shape:
 * - layer
 * - operation
 * - context
 * - identifiers
 * - correlationId
 * - errorSource
 * - details (built from toErrorContext, includes diagnosticId/table/timestamp if provided)
 */
export function logAuthError<L extends AuthLogLayer>(
  logger: Logger,
  ctx: AuthLayerContext<L>,
  params: {
    readonly errorSource: AuthErrorSource;
    readonly error: unknown;
    readonly kind?: AuthLogKind;
    readonly details?: Readonly<Record<string, unknown>>;
  },
): void {
  const { errorSource, error, kind = "error", details } = params;

  const payload: AuthLogPayload = {
    // Contextual details: includes layer/operation/context/identifiers/correlationId
    // plus any extra diagnostic metadata (diagnosticId, table, timestamp, etc.).
    details: toErrorContext(ctx, details),
    error,
    errorSource,
    identifiers: ctx.identifiers,
    kind,
    layer: ctx.layer,
    operation: ctx.operation,
  };

  logger.error("Auth error", payload);
}
