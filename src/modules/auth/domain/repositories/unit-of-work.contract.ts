import "server-only";

import type { AuthTxDepsContract } from "@/modules/auth/domain/repositories/auth-tx-deps.contract";

export interface UnitOfWorkContract {
  /**
   * Runs the callback inside a database transaction.
   *
   * The callback receives transaction-scoped *contracts* (repositories) that MUST be
   * used for any DB work intended to be atomic.
   */
  withTransaction<T>(fn: (tx: AuthTxDepsContract) => Promise<T>): Promise<T>;
}
