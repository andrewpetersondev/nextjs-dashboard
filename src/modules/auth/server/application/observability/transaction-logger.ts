import "server-only";

import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { TransactionLogger as SharedTransactionLogger } from "@/shared/logging/transaction-logger.use-case";
import { TRANSACTION_LOGGING_CONTEXT } from "@/shared/logging/transaction-logging-context.tokens";

/**
 * Auth-flavored transaction logger.
 * Keeps the existing import path stable, while using the shared implementation.
 */
export class TransactionLogger extends SharedTransactionLogger {
  constructor(logger: LoggingClientPort) {
    super(
      {
        operationContext: TRANSACTION_LOGGING_CONTEXT.authTx,
        operationNamePrefix: "TransactionLogger",
      },
      logger,
    );
  }
}
