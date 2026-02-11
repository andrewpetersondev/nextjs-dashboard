import "server-only";
import { TransactionLogger as SharedTransactionLogger } from "@/shared/telemetry/logging/application/transaction-logger.use-case";
import { TRANSACTION_LOGGING_CONTEXT } from "@/shared/telemetry/logging/application/transaction-logging-context.tokens";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

/**
 * Auth-flavored transaction logger.
 *
 * Keeps the existing import path stable, while using the shared implementation.
 */
export class AuthTransactionLogger extends SharedTransactionLogger {
  /**
   * Initializes the auth transaction logger.
   *
   * @param logger - The underlying logging client.
   */
  constructor(logger: LoggingClientContract) {
    super(
      {
        operationContext: TRANSACTION_LOGGING_CONTEXT.authTx,
        operationNamePrefix: "TransactionLogger",
      },
      logger,
    );
  }
}
