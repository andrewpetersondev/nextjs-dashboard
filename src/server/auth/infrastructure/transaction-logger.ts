// src/server/auth/infrastructure/repository/utils/transaction-logger.ts
import "server-only";
import { isBaseError } from "@/shared/core/errors/base-error";
import type { Logger } from "@/shared/logging/logger.shared";
import { toSafeErrorShape } from "@/shared/logging/logger.shared";

export class TransactionLogger {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.withContext("db.transaction");
  }

  start(transactionId: string): void {
    this.logger.operation("debug", "Transaction start", {
      event: "start",
      operation: "transaction",
      transactionId,
    });
  }

  commit(transactionId: string): void {
    this.logger.operation("debug", "Transaction commit", {
      event: "commit",
      operation: "transaction",
      transactionId,
    });
  }

  rollback(transactionId: string, error: unknown): void {
    if (isBaseError(error)) {
      this.logger.logBaseError(error, {
        extra: {
          event: "rollback",
          operation: "transaction",
          transactionId,
        },
        levelOverride: "warn",
        message: `Transaction rollback: ${error.message}`,
      });
      return;
    }

    this.logger.operation("warn", "Transaction rollback", {
      error: toSafeErrorShape(error),
      event: "rollback",
      operation: "transaction",
      transactionId,
    });
  }
}
