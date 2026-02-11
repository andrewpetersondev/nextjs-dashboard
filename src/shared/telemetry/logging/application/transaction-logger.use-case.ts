import "server-only";

import type { TransactionLoggingContext } from "@/shared/telemetry/logging/application/transaction-logging-context.tokens";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

/**
 * Configuration for the transaction lifecycle logger.
 */
export type TransactionLoggerConfig = Readonly<{
  operationContext: TransactionLoggingContext;
  operationNamePrefix: string;
}>;

/**
 * Standardized logger for database or multi-step unit-of-work transactions.
 */
export class TransactionLogger {
  private readonly logger: LoggingClientContract;
  private readonly operationContext: TransactionLoggingContext;
  private readonly operationNamePrefix: string;

  constructor(config: TransactionLoggerConfig, logger: LoggingClientContract) {
    this.logger = logger;
    this.operationContext = config.operationContext;
    this.operationNamePrefix = config.operationNamePrefix;
  }

  /**
   * Records the initiation of a transaction.
   */
  start(transactionId: string): void {
    this.logger.operation("debug", "Transaction start", {
      operationContext: this.operationContext,
      operationIdentifiers: { transactionId },
      operationName: `${this.operationNamePrefix}.start`,
    });
  }

  /**
   * Records a successful transaction completion.
   */
  commit(transactionId: string): void {
    this.logger.operation("debug", "Transaction commit", {
      operationContext: this.operationContext,
      operationIdentifiers: { transactionId },
      operationName: `${this.operationNamePrefix}.commit`,
    });
  }

  /**
   * Records a transaction failure and rollback.
   */
  rollback(error: unknown, transactionId: string): void {
    this.logger.operation("error", "Transaction rollback", {
      error,
      operationContext: this.operationContext,
      operationIdentifiers: { transactionId },
      operationName: `${this.operationNamePrefix}.rollback`,
    });
  }
}
