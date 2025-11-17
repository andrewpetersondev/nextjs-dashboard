// src/server/auth/logging/auth-logging.contexts.ts
import "server-only";
import type {
  AuthErrorSource,
  AuthLogPayload,
  AuthOperation,
} from "@/server/auth/logging/auth-logging.types";

/* ---------------------------- Context strings ----------------------------- */

export const AUTH_LOG_CONTEXTS = {
  /**
   * Action layer auth contexts:
   * - action.auth.login
   * - action.auth.signup
   * - action.auth.demoUser
   * - action.auth.logout
   */
  action: (operation: AuthOperation) => `action.auth.${operation}` as const,

  /**
   * DAL layer auth contexts:
   * - infrastructure.dal.auth.insertUser
   * - infrastructure.dal.auth.getUserByEmail
   * - infrastructure.dal.auth.withTransaction
   *
   * This now mirrors the `action` setup instead of being a fixed object.
   */
  dal: (operation: AuthOperation) =>
    `infrastructure.dal.auth.${operation}` as const,

  /**
   * Repository layer auth contexts:
   * - infrastructure.repository.auth.login
   * - infrastructure.repository.auth.signup
   * - ...
   */
  repository: (operation: AuthOperation) =>
    `infrastructure.repository.auth.${operation}` as const,

  /**
   * Service layer auth contexts:
   * - service.auth.login
   * - service.auth.signup
   * - service.auth.demoUser
   * - ...
   */
  service: (operation: AuthOperation) => `service.auth.${operation}` as const,

  /**
   * Special transaction context used by TransactionLogger.
   */
  transaction: "infrastructure.transaction.auth" as const,
} as const;

/* ------------------------- Action-level factories ------------------------- */

export const AuthActionLogFactory = {
  failure(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      kind: "failure",
      layer: "action",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  start(operation: AuthOperation): AuthLogPayload {
    return {
      kind: "start",
      layer: "action",
      operation,
    };
  },
  success(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      kind: "success",
      layer: "action",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  validation(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      kind: "validation",
      layer: "action",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
} as const;

/* ------------------------ Service-level factories ------------------------- */

export const AuthServiceLogFactory = {
  authInvariant(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      kind: "auth-invariant",
      layer: "service",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  exception(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
    error?: unknown,
  ): AuthLogPayload {
    return {
      kind: "exception",
      layer: "service",
      operation,
      ...(identifiers && { identifiers }),
      ...(error !== undefined && { error }),
    };
  },
  success(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      kind: "success",
      layer: "service",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  validation(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      kind: "validation",
      layer: "service",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
} as const;

/* ---------------------- Repository-level factories ------------------------ */

export const AuthRepoLogFactory = {
  exception(
    operation: AuthOperation,
    error: unknown,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      error,
      kind: "exception",
      layer: "infrastructure.repository",
      operation,
      ...(identifiers && { identifiers }),
      errorSource: "infrastructure.repository",
    };
  },
  notFound(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      kind: "not_found",
      layer: "infrastructure.repository",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  start(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      kind: "start",
      layer: "infrastructure.repository",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  success(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      kind: "success",
      layer: "infrastructure.repository",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
} as const;

/* -------------------------- DAL-level factories --------------------------- */

export const AuthDalLogFactory = {
  duplicate(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
    details?: AuthLogPayload["details"],
  ): AuthLogPayload {
    return {
      kind: "duplicate",
      layer: "infrastructure.dal",
      operation,
      ...(identifiers && { identifiers }),
      ...(details && { details }),
      errorSource: "infrastructure.dal",
    };
  },
  // biome-ignore lint/nursery/useMaxParams: <explanation>
  error(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
    details?: AuthLogPayload["details"],
    error?: unknown,
    errorSource: AuthErrorSource = "infrastructure.dal",
  ): AuthLogPayload {
    return {
      kind: "error",
      layer: "infrastructure.dal",
      operation,
      ...(identifiers && { identifiers }),
      ...(details && { details }),
      ...(error !== undefined && { error }),
      errorSource,
    };
  },
  notFound(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
  ): AuthLogPayload {
    return {
      kind: "not_found",
      layer: "infrastructure.dal",
      operation,
      ...(identifiers && { identifiers }),
      errorSource: "infrastructure.dal",
    };
  },
  success(
    operation: AuthOperation,
    identifiers?: AuthLogPayload["identifiers"],
    details?: AuthLogPayload["details"],
  ): AuthLogPayload {
    return {
      kind: "success",
      layer: "infrastructure.dal",
      operation,
      ...(identifiers && { identifiers }),
      ...(details && { details }),
    };
  },
} as const;

/* ----------------------- Transaction-level factory ------------------------ */

export interface TransactionLogExtra extends Record<string, unknown> {
  event: "start" | "commit" | "rollback";
  timestamp: string;
  error?: unknown;
}

export const TransactionLogFactory = {
  commit(transactionId: string): TransactionLogExtra {
    return {
      event: "commit",
      identifiers: { transactionId },
      timestamp: new Date().toISOString(),
    };
  },
  rollback(transactionId: string, error?: unknown): TransactionLogExtra {
    return {
      event: "rollback",
      identifiers: { transactionId },
      timestamp: new Date().toISOString(),
      ...(error !== undefined && { error }),
    };
  },
  start(transactionId: string): TransactionLogExtra {
    return {
      event: "start",
      identifiers: { transactionId },
      timestamp: new Date().toISOString(),
    };
  },
} as const;

/* ----------------------- Error mapping factory ---------------------------- */

export const ErrorMappingFactory = {
  pgError(code: string, detail?: string) {
    return {
      code,
      kind: "pg-error" as const,
      ...(detail && { detail }),
    };
  },
  unknownError(err: unknown) {
    return {
      error: err,
      kind: "unknown" as const,
    };
  },
} as const;
