import "server-only";

import { TransactionLogger as SharedTransactionLogger } from "@/shared/logging/application/transaction-logger.use-case";
import { TRANSACTION_LOGGING_CONTEXT } from "@/shared/logging/application/transaction-logging-context.tokens";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Auth-flavored transaction logger.
 * Keeps the existing import path stable, while using the shared implementation.
 */
export class AuthTransactionLoggerAdapter extends SharedTransactionLogger {
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
