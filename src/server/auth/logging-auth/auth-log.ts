// src/server/auth/logging-auth/auth-log.ts
import "server-only";
import type {
  AuthLogKind,
  AuthLogLayer,
  AuthLogPayload,
  AuthOperation,
} from "@/server/auth/logging-auth/auth-logging.types";
import type { LogLevel } from "@/shared/config/env-schemas";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as rootLogger } from "@/shared/logging/infra/logging.client";

/**
 * Creates a standardized auth log payload.
 */
function createAuthLogPayload(
  layer: AuthLogLayer,
  operation: AuthOperation,
  kind: AuthLogKind,
  data?: Partial<AuthLogPayload>,
): AuthLogPayload {
  return {
    kind,
    layer,
    operationName: operation,
    ...data,
  };
}

/**
 * Simplified auth logging factories organized by layer and operation.
 */
export const AuthLog = {
  action: {
    demoUser: {
      error: (error: unknown, identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "demoUser", "error", {
          error,
          errorSource: "action",
          operationIdentifiers: identifiers,
        }),
      failure: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "demoUser", "failure", {
          operationIdentifiers: identifiers,
        }),
      start: () => createAuthLogPayload("action", "demoUser", "start"),
      success: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "demoUser", "success", {
          operationIdentifiers: identifiers,
        }),
      validation: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "demoUser", "validation", {
          operationIdentifiers: identifiers,
        }),
    },

    login: {
      error: (error: unknown, identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "login", "error", {
          error,
          errorSource: "action",
          operationIdentifiers: identifiers,
        }),
      failure: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "login", "failure", {
          operationIdentifiers: identifiers,
        }),
      start: () => createAuthLogPayload("action", "login", "start"),
      success: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "login", "success", {
          operationIdentifiers: identifiers,
        }),
      validation: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "login", "validation", {
          operationIdentifiers: identifiers,
        }),
    },

    logout: {
      error: (error: unknown, identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "logout", "error", {
          error,
          errorSource: "action",
          operationIdentifiers: identifiers,
        }),
      start: () => createAuthLogPayload("action", "logout", "start"),
      success: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "logout", "success", {
          operationIdentifiers: identifiers,
        }),
    },

    signup: {
      error: (error: unknown, identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "signup", "error", {
          error,
          errorSource: "action",
          operationIdentifiers: identifiers,
        }),
      failure: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "signup", "failure", {
          operationIdentifiers: identifiers,
        }),
      start: () => createAuthLogPayload("action", "signup", "start"),
      success: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "signup", "success", {
          operationIdentifiers: identifiers,
        }),
      validation: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("action", "signup", "validation", {
          operationIdentifiers: identifiers,
        }),
    },
  },

  dal: {
    demoUserCounter: {
      error: (
        error: unknown,
        identifiers?: Record<string, string | number>,
        details?: Record<string, unknown>,
      ) =>
        createAuthLogPayload("infrastructure.dal", "demoUserCounter", "error", {
          details,
          error,
          errorSource: "infrastructure.dal",
          operationIdentifiers: identifiers,
        }),
      notFound: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload(
          "infrastructure.dal",
          "demoUserCounter",
          "not_found",
          {
            errorSource: "infrastructure.dal",
            operationIdentifiers: identifiers,
          },
        ),
      success: (
        identifiers?: Record<string, string | number>,
        details?: Record<string, unknown>,
      ) =>
        createAuthLogPayload(
          "infrastructure.dal",
          "demoUserCounter",
          "success",
          {
            details,
            operationIdentifiers: identifiers,
          },
        ),
    },

    getUserByEmail: {
      error: (
        error: unknown,
        identifiers?: Record<string, string | number>,
        details?: Record<string, unknown>,
      ) =>
        createAuthLogPayload("infrastructure.dal", "getUserByEmail", "error", {
          details,
          error,
          errorSource: "infrastructure.dal",
          operationIdentifiers: identifiers,
        }),
      notFound: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload(
          "infrastructure.dal",
          "getUserByEmail",
          "not_found",
          {
            errorSource: "infrastructure.dal",
            operationIdentifiers: identifiers,
          },
        ),
      success: (
        identifiers?: Record<string, string | number>,
        details?: Record<string, unknown>,
      ) =>
        createAuthLogPayload(
          "infrastructure.dal",
          "getUserByEmail",
          "success",
          {
            details,
            operationIdentifiers: identifiers,
          },
        ),
    },

    insertUser: {
      error: (
        error: unknown,
        identifiers?: Record<string, string | number>,
        details?: Record<string, unknown>,
      ) =>
        createAuthLogPayload("infrastructure.dal", "insertUser", "error", {
          details,
          error,
          errorSource: "infrastructure.dal",
          operationIdentifiers: identifiers,
        }),
      success: (
        identifiers?: Record<string, string | number>,
        details?: Record<string, unknown>,
      ) =>
        createAuthLogPayload("infrastructure.dal", "insertUser", "success", {
          details,
          operationIdentifiers: identifiers,
        }),
    },

    withTransaction: {
      commit: (transactionId: string) =>
        createAuthLogPayload(
          "infrastructure.dal",
          "withTransaction",
          "success",
          {
            details: {
              event: "commit",
              timestamp: new Date().toISOString(),
            },
            operationIdentifiers: { transactionId },
          },
        ),
      error: (transactionId: string, error: unknown) =>
        createAuthLogPayload("infrastructure.dal", "withTransaction", "error", {
          details: {
            event: "rollback",
            timestamp: new Date().toISOString(),
          },
          error,
          errorSource: "infrastructure.dal",
          operationIdentifiers: { transactionId },
        }),
      start: (transactionId: string) =>
        createAuthLogPayload("infrastructure.dal", "withTransaction", "start", {
          details: {
            event: "start",
            timestamp: new Date().toISOString(),
          },
          operationIdentifiers: { transactionId },
        }),
    },
  },

  repository: {
    login: {
      error: (error: unknown, identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("infrastructure.repository", "login", "error", {
          error,
          errorSource: "infrastructure.repository",
          operationIdentifiers: identifiers,
        }),
      exception: (
        error: unknown,
        identifiers?: Record<string, string | number>,
      ) =>
        createAuthLogPayload(
          "infrastructure.repository",
          "login",
          "exception",
          {
            error,
            errorSource: "infrastructure.repository",
            operationIdentifiers: identifiers,
          },
        ),
      notFound: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload(
          "infrastructure.repository",
          "login",
          "not_found",
          {
            operationIdentifiers: identifiers,
          },
        ),
      start: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("infrastructure.repository", "login", "start", {
          operationIdentifiers: identifiers,
        }),
      success: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("infrastructure.repository", "login", "success", {
          operationIdentifiers: identifiers,
        }),
    },

    signup: {
      error: (error: unknown, identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("infrastructure.repository", "signup", "error", {
          error,
          errorSource: "infrastructure.repository",
          operationIdentifiers: identifiers,
        }),
      exception: (
        error: unknown,
        identifiers?: Record<string, string | number>,
      ) =>
        createAuthLogPayload(
          "infrastructure.repository",
          "signup",
          "exception",
          {
            error,
            errorSource: "infrastructure.repository",
            operationIdentifiers: identifiers,
          },
        ),
      start: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("infrastructure.repository", "signup", "start", {
          operationIdentifiers: identifiers,
        }),
      success: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("infrastructure.repository", "signup", "success", {
          operationIdentifiers: identifiers,
        }),
    },
  },

  service: {
    demoUser: {
      error: (error: unknown, identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("service", "demoUser", "error", {
          error,
          errorSource: "service",
          operationIdentifiers: identifiers,
        }),
      start: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("service", "demoUser", "start", {
          operationIdentifiers: identifiers,
        }),
      success: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("service", "demoUser", "success", {
          operationIdentifiers: identifiers,
        }),
    },

    login: {
      error: (error: unknown, identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("service", "login", "error", {
          error,
          errorSource: "service",
          operationIdentifiers: identifiers,
        }),
      start: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("service", "login", "start", {
          operationIdentifiers: identifiers,
        }),
      success: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("service", "login", "success", {
          operationIdentifiers: identifiers,
        }),
    },

    signup: {
      error: (error: unknown, identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("service", "signup", "error", {
          error,
          errorSource: "service",
          operationIdentifiers: identifiers,
        }),
      start: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("service", "signup", "start", {
          operationIdentifiers: identifiers,
        }),
      success: (identifiers?: Record<string, string | number>) =>
        createAuthLogPayload("service", "signup", "success", {
          operationIdentifiers: identifiers,
        }),
    },
  },
} as const;

export interface LogAuthOptions {
  additionalData?: Record<string, unknown>;
  requestId?: string;
}

/**
 * Unified auth logging helper that automatically creates the correct logger
 * and routes to the appropriate logging method based on payload content.
 *
 * @example
 * // Simple usage
 * logAuth("info", "Login started", AuthLog.action.login.start());
 *
 * @example
 * // With request ID
 * logAuth("info", "Login started", AuthLog.action.login.start(), { requestId });
 *
 * @example
 * // With error
 * logAuth("error", "Login failed", AuthLog.action.login.error(error), { requestId });
 *
 * @example
 * // With additional details
 * logAuth("info", "User validated", AuthLog.action.login.success({ userId: "123" }), {
 *   requestId,
 *   additionalData: { duration: 150 }
 * });
 */
export function logAuth(
  level: LogLevel,
  message: string,
  payload: AuthLogPayload,
  options?: LogAuthOptions,
): void {
  const { additionalData, requestId } = options ?? {};

  // Create scoped logger with auth context
  const contextPath = `auth:${payload.layer}:${payload.operationName}`;
  let logger: LoggingClientContract = rootLogger.withContext(contextPath);

  if (requestId) {
    logger = logger.withRequest(requestId);
  }

  // Extract error from payload to keep it separate
  const { error, ...payloadWithoutError } = payload;

  // Merge additional data if provided
  const finalPayload = additionalData
    ? {
        ...payloadWithoutError,
        details: { ...payload.details, ...additionalData },
      }
    : payloadWithoutError;

  // Route to appropriate logging method
  if (error !== undefined) {
    // Use errorWithDetails for errors
    logger.errorWithDetails(message, error, finalPayload);
  } else {
    // Use operation for non-error logs
    logger.operation(level, message, {
      ...finalPayload,
      // Don't set operationContext - already in logger.withContext()
      operationName: payload.operationName,
    });
  }
}
