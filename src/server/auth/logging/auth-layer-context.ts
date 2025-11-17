// src/server/auth/logging/auth-layer-context.ts
import "server-only";
import { AUTH_LOG_CONTEXTS } from "@/server/auth/logging/auth-logging.contexts";
import type {
  AuthLogLayer,
  AuthOperation,
} from "@/server/auth/logging/auth-logging.types";

/**
 * Generic standardized context for any auth layer operation.
 * Provides consistent structure for logging and error handling.
 */
export interface AuthLayerContext<L extends AuthLogLayer = AuthLogLayer> {
  /** Layer from which the context originates (action/service/repository/dal). */
  readonly layer: L;
  /** Operation name (e.g., 'login', 'signup', 'insertUser'). */
  readonly operation: AuthOperation;
  /** Logger context path (e.g., 'infrastructure.dal.auth.insertUser'). */
  readonly context: string;
  /** Business identifiers for the operation. */
  readonly identifiers: Readonly<Record<string, string | number>>;
  /** Optional correlation ID for request tracing. */
  readonly correlationId?: string;
}

/**
 * Extended context with additional diagnostic information for DAL errors.
 */
export interface DalErrorContext
  extends AuthLayerContext<"infrastructure.dal"> {
  /** Unique diagnostic ID for this specific error. */
  readonly diagnosticId: string;
  /** ISO timestamp when error occurred. */
  readonly timestamp: string;
  /** Additional metadata for debugging. */
  readonly metadata?: Readonly<Record<string, unknown>>;
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
}): AuthLayerContext<L> {
  const { layer, operation, identifiers, correlationId } = params;

  const context = (() => {
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
    context,
    correlationId,
    identifiers,
    layer,
    operation,
  };
}
