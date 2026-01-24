import "server-only";
// biome-ignore lint/correctness/noNodejsModules: <server-only file>
import { randomUUID } from "node:crypto";
import type { AuthTxDepsContract } from "@/modules/auth/application/contracts/auth-tx-deps.contract";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import { AuthTransactionLogger } from "@/modules/auth/infrastructure/observability/auth-transaction.logger";
import type { AuthTxDepsFactory } from "@/modules/auth/infrastructure/persistence/factories/auth-tx-deps.factory";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Adapter implementing the Unit of Work pattern for the Auth module.
 *
 * @remarks
 * This adapter manages database transactions and ensures that all repositories
 * within the transaction scope share the same database client and logger context.
 */
export class AuthUnitOfWorkAdapter implements AuthUnitOfWorkContract {
  private readonly db: AppDatabase;
  private readonly logger: LoggingClientContract;
  private readonly makeTxDeps: AuthTxDepsFactory;
  private readonly requestId: string;

  constructor(
    db: AppDatabase,
    logger: LoggingClientContract,
    requestId: string,
    makeTxDeps: AuthTxDepsFactory,
  ) {
    this.db = db;
    this.logger = logger;
    this.requestId = requestId;
    this.makeTxDeps = makeTxDeps;
  }

  /**
   * Executes a function within a database transaction.
   *
   * @param fn - The function to execute within the transaction context.
   * @returns The result of the executed function.
   * @throws Error if the database does not support transactions or if the transaction fails.
   */
  async withTransaction<T>(
    fn: (tx: AuthTxDepsContract) => Promise<T>,
  ): Promise<T> {
    const dbWithTx = this.db as AppDatabase & {
      transaction<R>(scope: (tx: AppDatabase) => Promise<R>): Promise<R>;
    };

    if (typeof dbWithTx.transaction !== "function") {
      throw new Error("Database does not support transactions");
    }

    const transactionId = randomUUID();

    const txLogger = this.logger
      .child({ scope: "uow", transactionId })
      .withRequest(this.requestId)
      .withContext("auth:tx");

    const txEvents = new AuthTransactionLogger(txLogger);

    txEvents.start(transactionId);

    try {
      const result = await dbWithTx.transaction(async (txDb: AppDatabase) => {
        const txDeps = this.makeTxDeps(txDb, txLogger, this.requestId);
        return await fn(txDeps);
      });

      txEvents.commit(transactionId);
      return result;
    } catch (err) {
      txEvents.rollback(err, transactionId);
      throw err;
    }
  }
}
