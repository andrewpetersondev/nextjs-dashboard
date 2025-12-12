import "server-only";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

/**
 * Lightweight transaction logger.
 * Uses the shared logger.operation API.
 */
export class TransactionLogger {
  constructor(private readonly logger: LoggingClientContract) {}

  start(transactionId: string): void {
    this.logger.operation("debug", "Transaction start", {
      operationContext: "auth:repo",
      operationIdentifiers: { transactionId },
      operationName: "withTransaction.start",
    });
  }

  commit(transactionId: string): void {
    this.logger.operation("debug", "Transaction commit", {
      operationContext: "auth:repo",
      operationIdentifiers: { transactionId },
      operationName: "withTransaction.commit",
    });
  }

  rollback(transactionId: string, error: unknown): void {
    this.logger.operation("error", "Transaction rollback", {
      error,
      operationContext: "auth:repo",
      operationIdentifiers: { transactionId },
      operationName: "withTransaction.rollback",
    });
  }
}
