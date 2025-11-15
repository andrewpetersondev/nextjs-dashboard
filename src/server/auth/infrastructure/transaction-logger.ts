// src/server/auth/infrastructure/transaction-logger.ts
import "server-only";
import { INFRASTRUCTURE_CONTEXTS } from "@/server/auth/infrastructure/infrastructure-error.logging";
import { isBaseError } from "@/shared/core/errors/base-error";
import type { Logger } from "@/shared/logging/logger.shared";

export class TransactionLogger {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.withContext(
      INFRASTRUCTURE_CONTEXTS.transaction.context,
    );
  }

  start(transactionId: string): void {
    const data = INFRASTRUCTURE_CONTEXTS.transaction.start(transactionId);
    this.logger.operation("debug", "Transaction start", data);
  }

  commit(transactionId: string): void {
    const data = INFRASTRUCTURE_CONTEXTS.transaction.commit(transactionId);
    this.logger.operation("debug", "Transaction commit", data);
  }

  rollback(transactionId: string, error: unknown): void {
    const data = INFRASTRUCTURE_CONTEXTS.transaction.rollback(
      transactionId,
      error,
    );
    if (isBaseError(error)) {
      this.logger.logBaseError(error, {
        extra: data,
        levelOverride: "warn",
        message: `Transaction rollback: ${error.message}`,
      });
      return;
    }
    this.logger.operation("warn", "Transaction rollback", data);
  }
}
