// src/server/auth/logging/auth-logging.contexts.ts
import "server-only";
import type {
  AuthActionLog,
  AuthDalLog,
  AuthOperation,
  AuthRepoLog,
  AuthServiceLog,
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
    identifiers?: AuthActionLog["identifiers"],
  ): AuthActionLog {
    return {
      kind: "failure",
      layer: "action",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  start(operation: AuthOperation): AuthActionLog {
    return {
      kind: "start",
      layer: "action",
      operation,
    };
  },
  success(
    operation: AuthOperation,
    identifiers?: AuthActionLog["identifiers"],
  ): AuthActionLog {
    return {
      kind: "success",
      layer: "action",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  validation(
    operation: AuthOperation,
    identifiers?: AuthActionLog["identifiers"],
  ): AuthActionLog {
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
    identifiers?: AuthServiceLog["identifiers"],
  ): AuthServiceLog {
    return {
      kind: "auth-invariant",
      layer: "service",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  exception(
    operation: AuthOperation,
    identifiers?: AuthServiceLog["identifiers"],
    error?: unknown,
  ): AuthServiceLog {
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
    identifiers?: AuthServiceLog["identifiers"],
  ): AuthServiceLog {
    return {
      kind: "success",
      layer: "service",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  validation(
    operation: AuthOperation,
    identifiers?: AuthServiceLog["identifiers"],
  ): AuthServiceLog {
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
    identifiers?: AuthRepoLog["identifiers"],
  ): AuthRepoLog {
    return {
      error,
      kind: "exception",
      layer: "infrastructure.repository",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  notFound(
    operation: AuthOperation,
    identifiers?: AuthRepoLog["identifiers"],
  ): AuthRepoLog {
    return {
      kind: "not_found",
      layer: "infrastructure.repository",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  start(
    operation: AuthOperation,
    identifiers?: AuthRepoLog["identifiers"],
  ): AuthRepoLog {
    return {
      kind: "start",
      layer: "infrastructure.repository",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  success(
    operation: AuthOperation,
    identifiers?: AuthRepoLog["identifiers"],
  ): AuthRepoLog {
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
    identifiers?: AuthDalLog["identifiers"],
  ): AuthDalLog {
    return {
      kind: "duplicate",
      layer: "infrastructure.dal",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  error(
    operation: AuthOperation,
    identifiers?: AuthDalLog["identifiers"],
    details?: AuthDalLog["details"],
  ): AuthDalLog {
    return {
      kind: "error",
      layer: "infrastructure.dal",
      operation,
      ...(identifiers && { identifiers }),
      ...(details && { details }),
    };
  },
  notFound(
    operation: AuthOperation,
    identifiers?: AuthDalLog["identifiers"],
  ): AuthDalLog {
    return {
      kind: "not_found",
      layer: "infrastructure.dal",
      operation,
      ...(identifiers && { identifiers }),
    };
  },
  success(
    operation: AuthOperation,
    identifiers?: AuthDalLog["identifiers"],
    details?: AuthDalLog["details"],
  ): AuthDalLog {
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
