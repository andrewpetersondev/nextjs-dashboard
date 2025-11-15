// src/server/auth/infrastructure/repository/types/dal-context.ts
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
