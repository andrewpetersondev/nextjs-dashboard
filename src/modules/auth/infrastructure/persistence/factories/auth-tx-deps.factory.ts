import "server-only";
import type { AuthTxDeps } from "@/modules/auth/application/authn/contracts/auth-tx.deps";
import { AuthUserRepositoryAdapter } from "@/modules/auth/infrastructure/persistence/adapters/auth-user-repository.adapter";
import { AuthUserRepository } from "@/modules/auth/infrastructure/persistence/repositories/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory type for creating transaction-scoped auth dependencies.
 */
export type AuthTxDepsFactory = (
  txDb: AppDatabase,
  txLogger: LoggingClientContract,
  requestId: string,
) => AuthTxDeps;

/**
 * Factory for creating transaction-scoped dependency contracts for auth persistence.
 *
 * @remarks
 * This keeps repository wiring out of the UnitOfWork adapter so "factories do wiring"
 * and the adapter focuses on transaction mechanics.
 *
 * @param txDb - The transaction-scoped database connection.
 * @param txLogger - The transaction-scoped logger.
 * @param requestId - Unique identifier for the current request.
 * @returns An object containing transaction-scoped dependencies.
 */
export function authTxDepsFactory(
  txDb: AppDatabase,
  txLogger: LoggingClientContract,
  requestId: string,
): AuthTxDeps {
  const authUserRepo = new AuthUserRepository(txDb, txLogger, requestId);
  const authUsers = new AuthUserRepositoryAdapter(authUserRepo);

  return {
    authUsers,
  };
}
