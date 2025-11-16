// src/server/auth/infrastructure/transaction-logger.ts
import "server-only";
import {
  AUTH_LOG_CONTEXTS,
  TransactionLogFactory,
} from "@/server/auth/logging/auth-logging.contexts";
import { isBaseError } from "@/shared/errors/base-error";
import type { Logger } from "@/shared/logging/logger.shared";

export class TransactionLogger {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.withContext(AUTH_LOG_CONTEXTS.transaction);
  }

  start(transactionId: string): void {
    const data = TransactionLogFactory.start(transactionId);
    this.logger.operation("debug", "Transaction start", {
      context: AUTH_LOG_CONTEXTS.transaction,
      operation: "transaction",
      ...data,
    });
  }

  commit(transactionId: string): void {
    const data = TransactionLogFactory.commit(transactionId);
    this.logger.operation("debug", "Transaction commit", {
      context: AUTH_LOG_CONTEXTS.transaction,
      operation: "transaction",
      ...data,
    });
  }

  rollback(transactionId: string, error: unknown): void {
    const data = TransactionLogFactory.rollback(transactionId, error);
    if (isBaseError(error)) {
      this.logger.logBaseError(error, {
        extra: data,
        levelOverride: "warn",
        message: `Transaction rollback: ${error.message}`,
      });
      return;
    }
    this.logger.operation("warn", "Transaction rollback", {
      context: AUTH_LOG_CONTEXTS.transaction,
      operation: "transaction",
      ...data,
    });
  }
}
