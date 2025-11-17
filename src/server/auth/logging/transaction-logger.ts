// src/server/auth/logging/transaction-logger.ts
import "server-only";
import { createAuthLogger } from "@/server/auth/logging/auth-logger.shared";
import {
  AUTH_LOG_CONTEXTS,
  TransactionLogFactory,
} from "@/server/auth/logging/auth-logging.contexts";
import type { Logger } from "@/shared/logging/logger.shared";

export class TransactionLogger {
  private readonly logger: Logger;

  /**
   * Default: uses `auth:infrastructure.transaction` as the base context.
   * You can still inject a parent logger if you need request-level context.
   */
  constructor(parentLogger?: Logger) {
    const base = parentLogger ?? createAuthLogger("infrastructure.transaction");
    this.logger = base.withContext(AUTH_LOG_CONTEXTS.transaction);
  }

  start(transactionId: string): void {
    const data = TransactionLogFactory.start(transactionId);
    this.logger.operation("debug", "Transaction start", {
      context: AUTH_LOG_CONTEXTS.transaction,
      operation: "withTransaction",
      ...data,
    });
  }

  commit(transactionId: string): void {
    const data = TransactionLogFactory.commit(transactionId);
    this.logger.operation("debug", "Transaction commit", {
      context: AUTH_LOG_CONTEXTS.transaction,
      operation: "withTransaction",
      ...data,
    });
  }

  rollback(transactionId: string, error: unknown): void {
    const data = TransactionLogFactory.rollback(transactionId, error);

    this.logger.errorWithDetails("Transaction rollback", error, {
      context: AUTH_LOG_CONTEXTS.transaction,
      operation: "withTransaction",
      ...data,
    });
  }
}
