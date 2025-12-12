import "server-only";

import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { TransactionLogger as SharedTransactionLogger } from "@/shared/logging/transaction-logger";
import { TRANSACTION_LOGGING_CONTEXT } from "@/shared/logging/transaction-logging-context.types";

/**
 * Auth-flavored transaction logger.
 * Keeps the existing import path stable, while using the shared implementation.
 */
export class TransactionLogger extends SharedTransactionLogger {
  constructor(logger: LoggingClientContract) {
    super({ operationContext: TRANSACTION_LOGGING_CONTEXT.authRepo }, logger);
  }
}
