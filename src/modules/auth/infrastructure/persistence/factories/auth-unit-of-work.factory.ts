import "server-only";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import { AuthUnitOfWorkAdapter } from "@/modules/auth/infrastructure/persistence/adapters/auth-unit-of-work.adapter";
import { authTxDepsFactory } from "@/modules/auth/infrastructure/persistence/factories/auth-tx-deps.factory";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for creating the auth Unit of Work.
 *
 * @param db - The main database connection.
 * @param logger - The logging client.
 * @param requestId - Unique identifier for the current request.
 * @returns An implementation of the {@link AuthUnitOfWorkContract}.
 */
export function authUnitOfWorkFactory(
  db: AppDatabase,
  logger: LoggingClientContract,
  requestId: string,
): AuthUnitOfWorkContract {
  return new AuthUnitOfWorkAdapter(db, logger, requestId, authTxDepsFactory);
}
