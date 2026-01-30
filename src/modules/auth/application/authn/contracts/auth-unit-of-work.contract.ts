import type { AuthTxDeps } from "@/modules/auth/application/authn/contracts/auth-tx.deps";

/**
 * Interface for managing database transactions within the authentication module.
 *
 * The Unit of Work ensures that multiple repository operations can be performed
 * atomically, maintaining data consistency.
 */
export interface AuthUnitOfWorkContract {
  /**
   * Runs the provided callback function inside a database transaction.
   *
   * The callback receives transaction-scoped contracts (repositories) that must be
   * used for any database work intended to be part of the atomic operation.
   *
   * @param fn - The function to execute within the transaction.
   * @returns The result of the callback function.
   * @throws {Error} If the transaction fails or the callback throws.
   */
  withTransaction<T>(fn: (tx: AuthTxDeps) => Promise<T>): Promise<T>;
}
