// src/server/auth/infrastructure/repository/utils/transaction-logger.ts
import "server-only";
import type { Logger } from "@/shared/logging/logger.shared";

export class TransactionLogger {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.withContext("repository.transaction");
  }

  logStart(transactionId: string): void {
    this.logger.operation("debug", "Transaction start", {
      event: "start",
      operation: "transaction",
      transactionId,
    });
  }

  logCommit(transactionId: string): void {
    this.logger.operation("debug", "Transaction commit", {
      event: "commit",
      operation: "transaction",
      transactionId,
    });
  }

  logRollback(transactionId: string, error: unknown): void {
    this.logger.operation("warn", "Transaction rollback", {
      error: error instanceof Error ? error.message : String(error),
      event: "rollback",
      operation: "transaction",
      transactionId,
    });
  }
}
