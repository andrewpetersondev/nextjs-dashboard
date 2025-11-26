// src/server/auth/logging/transaction-logger.ts
import "server-only";
import { AuthLog, logAuth } from "@/server/auth/logging/auth-log";

/**
 * Lightweight transaction logger for auth-related DAL transactions.
 * Uses the unified AuthLog + logAuth API.
 */
export class TransactionLogger {
  private readonly requestId?: string;

  constructor(requestId?: string) {
    this.requestId = requestId;
  }

  start(transactionId: string): void {
    logAuth(
      "debug",
      "Transaction start",
      AuthLog.dal.withTransaction.start(transactionId),
      { requestId: this.requestId },
    );
  }

  commit(transactionId: string): void {
    logAuth(
      "debug",
      "Transaction commit",
      AuthLog.dal.withTransaction.commit(transactionId),
      { requestId: this.requestId },
    );
  }

  rollback(transactionId: string, error: unknown): void {
    logAuth(
      "error",
      "Transaction rollback",
      AuthLog.dal.withTransaction.error(transactionId, error),
      { requestId: this.requestId },
    );
  }
}
