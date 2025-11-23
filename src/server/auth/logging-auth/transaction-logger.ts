// src/server/auth/logging/transaction-logger.ts
import "server-only";
import {
  createAuthLogger,
  logAuthError,
} from "@/server/auth/logging-auth/auth-logger.shared";
import {
  AUTH_LOG_CONTEXTS,
  TransactionLogFactory,
} from "@/server/auth/logging-auth/auth-logging.contexts";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

export class TransactionLogger {
  private readonly logger: LoggingClientContract;

  /**
   * Default: uses `auth:infrastructure.transaction` as the base context.
   * You can still inject a parent logger if you need request-level context.
   */
  constructor(parentLogger?: LoggingClientContract) {
    const base = parentLogger ?? createAuthLogger("infrastructure.transaction");
    this.logger = base.withContext(AUTH_LOG_CONTEXTS.transaction);
  }

  start(transactionId: string): void {
    const data = TransactionLogFactory.start(transactionId);
    this.logger.operation("debug", "Transaction start", {
      operationContext: AUTH_LOG_CONTEXTS.transaction,
      operationName: "withTransaction",
      ...data,
    });
  }

  commit(transactionId: string): void {
    const data = TransactionLogFactory.commit(transactionId);
    this.logger.operation("debug", "Transaction commit", {
      operationContext: AUTH_LOG_CONTEXTS.transaction,
      operationName: "withTransaction",
      ...data,
    });
  }

  rollback(transactionId: string, error: unknown): void {
    // Extract error from factory payload to avoid duplication in logging context
    // since it's already passed as the main error argument
    const payload = TransactionLogFactory.rollback(transactionId, error);

    logAuthError(this.logger, "Transaction rollback", {
      ...payload,
      errorSource: "infrastructure.dal",
      kind: "error",
      layer: "infrastructure.dal",
      operationContext: AUTH_LOG_CONTEXTS.transaction,
      operationName: "withTransaction",
    });
  }
}
