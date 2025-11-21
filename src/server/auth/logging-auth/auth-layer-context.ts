// src/server/auth/logging/auth-layer-context.ts
import "server-only";
import { AUTH_LOG_CONTEXTS } from "@/server/auth/logging-auth/auth-logging.contexts";
import type {
  AuthLogLayer,
  AuthOperation,
} from "@/server/auth/logging-auth/auth-logging.types";
import type { ErrorContext } from "@/shared/errors/core/base-error.types";
import type { LogEventContext } from "@/shared/logging/logger.types";

/**
 * Generic standardized context for any auth layer operation.
 * Provides consistent structure for logging and error handling.
 */
export interface AuthLogLayerContext<L extends AuthLogLayer = AuthLogLayer> {
  /** Optional correlation ID for request tracing. */
  readonly correlationId?: string;
  /** Business identifiers for the operation. */
  readonly identifiers: Readonly<Record<string, string | number>>;
  /** Layer from which the context originates (action/service/repository/dal). */
  readonly layer: L;
  /** Logger context path (e.g., 'infrastructure.dal.auth.insertUser'). */
  readonly loggerContext: string;
  /** Operation name (e.g., 'login', 'signup', 'insertUser'). */
  readonly operation: AuthOperation;
}

/**
 * Unified factory for creating standardized auth operation contexts
 * across all layers (action, service, repository, dal).
 *
 * Example usages:
 * - createAuthOperationContext({
 *     layer: "action",
 *     operation: "login",
 *     identifiers: { email },
 *   })
 *
 * - createAuthOperationContext({
 *     layer: "infrastructure.dal",
 *     operation: "insertUser",
 *     identifiers: { email, username },
 *   })
 */
export function createAuthOperationContext<
  L extends AuthLogLayer,
  O extends AuthOperation,
>(params: {
  layer: L;
  operation: O;
  identifiers: Record<string, string | number>;
  correlationId?: string;
}): AuthLogLayerContext<L> {
  const { layer, operation, identifiers, correlationId } = params;

  const loggerContext = (() => {
    switch (layer) {
      case "action":
        return AUTH_LOG_CONTEXTS.action(operation);
      case "service":
        return AUTH_LOG_CONTEXTS.service(operation);
      case "infrastructure.repository":
        return AUTH_LOG_CONTEXTS.repository(operation);
      case "infrastructure.dal":
        return AUTH_LOG_CONTEXTS.dal(operation);
      default: {
        // Exhaustive check for future-proofing
        const _never: never = layer;
        return _never;
      }
    }
  })();

  return {
    correlationId,
    identifiers,
    layer,
    loggerContext,
    operation,
  };
}

/**
 * Helper to convert an AuthLayerContext into a generic ErrorContext.
 *
 * This is the single, unified shape used by errors across all layers.
 * Callers can optionally provide extra metadata (e.g. diagnosticId, table, timestamp).
 *
 * Design: this intentionally omits logging-only fields such as `loggerContext`
 * or correlation/request IDs. Those belong in LogEventContext, not ErrorContext.
 */
export function toErrorContext<L extends AuthLogLayer>(
  authContext: AuthLogLayerContext<L>,
  extras?: Readonly<Record<string, unknown>>,
): ErrorContext {
  return {
    identifiers: authContext.identifiers,
    layer: authContext.layer,
    operation: authContext.operation,
    ...(extras ?? {}),
  } as const;
}

/**
 * Helper to convert an AuthLayerContext into logging metadata.
 *
 * This produces operational context for the logging event, not diagnostic error context.
 * For error diagnostics, use the identifiers/operation/layer fields directly.
 */
export function toLoggingContext<L extends AuthLogLayer>(
  authContext: AuthLogLayerContext<L>,
  extras?: Readonly<Record<string, unknown>>,
): LogEventContext {
  return {
    correlationId: authContext.correlationId,
    loggerContext: authContext.loggerContext,
    operation: authContext.operation,
    ...(extras ?? {}),
  } as const;
}
