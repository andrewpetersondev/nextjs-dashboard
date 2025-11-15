// src/server/auth/infrastructure/repository/utils/transaction-logger.ts
import "server-only";
import { isBaseError } from "@/shared/core/errors/base-error";
import type { Logger } from "@/shared/logging/logger.shared";

/**
 * Transaction-specific logger for database operations.
 *
 * Provides consistent, structured logging for transaction lifecycle events
 * with automatic BaseError detection and appropriate handling.
 */
export class TransactionLogger {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.withContext("repository.transaction");
  }

  /**
   * Log transaction start event.
   */
  logStart(transactionId: string): void {
    this.logger.operation("debug", "Transaction start", {
      event: "start",
      operation: "transaction",
      transactionId,
    });
  }

  /**
   * Log transaction commit event.
   */
  logCommit(transactionId: string): void {
    this.logger.operation("debug", "Transaction commit", {
      event: "commit",
      operation: "transaction",
      transactionId,
    });
  }

  /**
   * Log transaction rollback event with error context.
   *
   * @remarks
   * - Automatically detects BaseError instances for rich structured logging
   * - Falls back to safe string representation for unknown errors
   * - Uses warn level as rollbacks are recoverable but noteworthy
   */
  logRollback(transactionId: string, error: unknown): void {
    if (isBaseError(error)) {
      // Log BaseError with full context
      this.logger.logBaseError(error, {
        extra: {
          event: "rollback",
          operation: "transaction",
          transactionId,
        },
        levelOverride: "warn",
        message: `Transaction rollback: ${error.message}`,
      });
    } else {
      // Fallback for non-BaseError
      this.logger.operation("warn", "Transaction rollback", {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.name : typeof error,
        event: "rollback",
        operation: "transaction",
        transactionId,
      });
    }
  }
}
