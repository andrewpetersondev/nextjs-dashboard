// src/server/auth/infrastructure/dal-context.ts
import "server-only";

/**
 * Standardized context for all DAL operations.
 * Provides consistent structure for logging and error handling.
 */
export interface DalContext {
  /** DAL operation name (e.g., 'insertUser', 'getUserByEmail') */
  readonly operation: string;
  /** Logger context path (e.g., 'dal.users') */
  readonly context: string;
  /** Business identifiers for the operation */
  readonly identifiers: Readonly<Record<string, string | number>>;
  /** Optional correlation ID for request tracing */
  readonly correlationId?: string;
}

/**
 * Extended context with additional diagnostic information.
 */
export interface DalErrorContext extends DalContext {
  /** Unique diagnostic ID for this specific error */
  readonly diagnosticId: string;
  /** ISO timestamp when error occurred */
  readonly timestamp: string;
  /** Additional metadata for debugging */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Repository operation context.
 */
export interface RepositoryContext {
  readonly operation: string;
  readonly kind: "start" | "success" | "exception";
  readonly identifiers?: Record<string, unknown>;
  readonly error?: unknown;
}

/**
 * DAL operation result metadata.
 */
export interface DalResultMetadata {
  readonly kind: "success" | "not-found" | "duplicate" | "error";
  readonly identifiers: Record<string, string | number>;
  readonly details?: Record<string, unknown>;
}

/**
 * Factory for creating standardized DAL contexts.
 */
export const createDalContext = (
  operation: string,
  contextPath: string,
  identifiers: Record<string, string | number>,
  correlationId?: string,
): DalContext => ({
  context: contextPath,
  correlationId,
  identifiers,
  operation,
});

/**
 * Factory for creating error contexts with diagnostics.
 */
export const createDalErrorContext = (
  dalContext: DalContext,
  diagnosticId: string,
  metadata?: Record<string, unknown>,
): DalErrorContext => ({
  ...dalContext,
  diagnosticId,
  metadata,
  timestamp: new Date().toISOString(),
});
