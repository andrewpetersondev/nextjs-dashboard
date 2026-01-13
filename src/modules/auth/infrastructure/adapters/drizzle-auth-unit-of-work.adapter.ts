import "server-only";

// biome-ignore lint/correctness/noNodejsModules: <server-only file>
import { randomUUID } from "node:crypto";
import type { AuthTxDepsContract } from "@/modules/auth/application/contracts/auth-tx-deps.contract";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import { AuthUserRepositoryAdapter } from "@/modules/auth/infrastructure/adapters/auth-user-repository.adapter";
import { TransactionLogger } from "@/modules/auth/infrastructure/observability/transaction-logger";
import { AuthUserRepository } from "@/modules/auth/infrastructure/repositories/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export class DrizzleAuthUnitOfWorkAdapter implements AuthUnitOfWorkContract {
  private readonly db: AppDatabase;
  private readonly logger: LoggingClientContract;
  private readonly requestId: string;

  constructor(
    db: AppDatabase,
    logger: LoggingClientContract,
    requestId: string,
  ) {
    this.db = db;
    this.logger = logger;
    this.requestId = requestId;
  }

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

    const txEvents = new TransactionLogger(txLogger);

    txEvents.start(transactionId);

    try {
      const result = await dbWithTx.transaction(async (txDb: AppDatabase) => {
        const txAuthUserRepo = new AuthUserRepository(
          txDb,
          txLogger,
          this.requestId,
        );
        const txDeps: AuthTxDepsContract = {
          authUsers: new AuthUserRepositoryAdapter(txAuthUserRepo),
        };

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
