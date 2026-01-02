import "server-only";

import { TransactionLogger as SharedTransactionLogger } from "@/shared/logging/application/transaction-logger.use-case";
import { TRANSACTION_LOGGING_CONTEXT } from "@/shared/logging/application/transaction-logging-context.tokens";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

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
