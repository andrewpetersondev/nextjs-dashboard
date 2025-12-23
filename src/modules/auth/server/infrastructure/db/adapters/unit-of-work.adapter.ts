import "server-only";

import { randomUUID } from "node:crypto";
import { TransactionLogger } from "@/modules/auth/server/application/observability/transaction-logger";
import type { UnitOfWorkPort } from "@/modules/auth/server/application/ports/unit-of-work.port";
import type { AuthTxDeps } from "@/modules/auth/server/application/types/auth-tx-deps.types";
import { AuthUserRepositoryAdapter } from "@/modules/auth/server/infrastructure/db/adapters/auth-user-repository.adapter";
import { AuthUserRepository } from "@/modules/auth/server/infrastructure/db/repositories/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

export class DbUnitOfWorkAdapter implements UnitOfWorkPort {
  private readonly db: AppDatabase;
  private readonly logger: LoggingClientPort;
  private readonly requestId: string;

  constructor(db: AppDatabase, logger: LoggingClientPort, requestId: string) {
    this.db = db;
    this.logger = logger;
    this.requestId = requestId;
  }

  async withTransaction<T>(fn: (tx: AuthTxDeps) => Promise<T>): Promise<T> {
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
        const txDeps: AuthTxDeps = {
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
