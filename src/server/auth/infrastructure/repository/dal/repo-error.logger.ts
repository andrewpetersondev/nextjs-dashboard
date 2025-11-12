import "server-only";
import { isBaseError } from "@/shared/core/errors/base/base-error";
import type { Logger, OperationMetadata } from "@/shared/logging/logger.shared";
import { logger as defaultLogger } from "@/shared/logging/logger.shared";

/**
 * Specialized error logger for repository/DAL operations.
 * Provides consistent error logging with appropriate context and metadata.
 */
export class RepoErrorLogger {
  private readonly logger: Logger;

  constructor(logger: Logger = defaultLogger) {
    this.logger = logger.withContext("repository");
  }

  /**
   * Log an error from a DAL operation with full diagnostic context.
   */
  logDalError(
    error: unknown,
    metadata: OperationMetadata,
    additionalContext?: Record<string, unknown>,
  ): void {
    if (isBaseError(error)) {
      this.logger.operation(
        "error",
        `DAL operation failed: ${metadata.operation}`,
        {
          category: error.category,
          code: error.code,
          context: metadata.context,
          diagnosticId: error.context?.diagnosticId,
          errorMessage: error.message,
          identifiers: metadata.identifiers,
          operation: metadata.operation,
          retryable: error.retryable,
          severity: error.severity,
          ...(additionalContext ?? {}),
        },
      );
    } else if (error instanceof Error) {
      this.logger.operation(
        "error",
        `DAL operation failed: ${metadata.operation}`,
        {
          context: metadata.context,
          errorMessage: error.message,
          errorName: error.name,
          identifiers: metadata.identifiers,
          operation: metadata.operation,
          stack: error.stack,
          ...(additionalContext ?? {}),
        },
      );
    } else {
      this.logger.operation(
        "error",
        `DAL operation failed: ${metadata.operation}`,
        {
          context: metadata.context,
          error: String(error),
          identifiers: metadata.identifiers,
          operation: metadata.operation,
          ...(additionalContext ?? {}),
        },
      );
    }
  }

  /**
   * Log a successful DAL operation.
   */
  logDalSuccess(
    metadata: OperationMetadata,
    result?: Record<string, unknown>,
  ): void {
    this.logger.operation(
      "debug",
      `DAL operation succeeded: ${metadata.operation}`,
      {
        context: metadata.context,
        identifiers: metadata.identifiers,
        operation: metadata.operation,
        ...(result ?? {}),
      },
    );
  }

  /**
   * Log a repository transaction lifecycle event.
   */
  logTransaction(
    event: "start" | "commit" | "rollback",
    metadata: Partial<OperationMetadata> & { transactionId?: string },
  ): void {
    const level = event === "rollback" ? "warn" : "debug";
    this.logger.operation(level, `Transaction ${event}`, {
      context: metadata.context,
      event,
      identifiers: metadata.identifiers,
      operation: metadata.operation ?? "transaction",
      transactionId: metadata.transactionId,
    });
  }
}

/**
 * Default shared instance for repository error logging.
 */
export const repoErrorLogger = new RepoErrorLogger();
