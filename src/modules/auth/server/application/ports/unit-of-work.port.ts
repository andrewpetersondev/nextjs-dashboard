import type { AuthTxDeps } from "@/modules/auth/server/application/types/auth-tx-deps.types";

export interface UnitOfWorkPort {
  /**
   * Runs the callback inside a database transaction.
   *
   * The callback receives transaction-scoped *ports* (repositories) that MUST be
   * used for any DB work intended to be atomic.
   */
  withTransaction<T>(fn: (tx: AuthTxDeps) => Promise<T>): Promise<T>;
}
