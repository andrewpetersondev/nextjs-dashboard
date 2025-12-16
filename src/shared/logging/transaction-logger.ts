import "server-only";

import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import type { TransactionLoggingContext } from "@/shared/logging/transaction-logging-context.types";

// TODO: I made operationNamePrefix required. I moved the transaction out of auth-user.repository and into use-cases.
//  so i need to update the usages. I need to standardize TransactionLoggingContext and operationNamePrefix across the
//  app. Consider making a factory function to create TransactionLogger instances with standard configs.
export type TransactionLoggerConfig = {
  operationContext: TransactionLoggingContext;
  operationNamePrefix: string;
};

export class TransactionLogger {
  private readonly logger: LoggingClientContract;
  private readonly operationContext: TransactionLoggingContext;
  private readonly operationNamePrefix: string;

  constructor(config: TransactionLoggerConfig, logger: LoggingClientContract) {
    this.logger = logger;
    this.operationContext = config.operationContext;
    this.operationNamePrefix = config.operationNamePrefix;
  }

  start(transactionId: string): void {
    this.logger.operation("debug", "Transaction start", {
      operationContext: this.operationContext,
      operationIdentifiers: { transactionId },
      operationName: `${this.operationNamePrefix}.start`,
    });
  }

  commit(transactionId: string): void {
    this.logger.operation("debug", "Transaction commit", {
      operationContext: this.operationContext,
      operationIdentifiers: { transactionId },
      operationName: `${this.operationNamePrefix}.commit`,
    });
  }

  rollback(error: unknown, transactionId: string): void {
    this.logger.operation("error", "Transaction rollback", {
      error,
      operationContext: this.operationContext,
      operationIdentifiers: { transactionId },
      operationName: `${this.operationNamePrefix}.rollback`,
    });
  }
}
