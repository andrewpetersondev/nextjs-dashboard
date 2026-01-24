// New file: src/modules/auth/infrastructure/persistence/factories/auth-tx-deps.factory.types.ts
import type { AuthTxDepsContract } from "@/modules/auth/application/contracts/auth-tx-deps.contract";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export type AuthTxDepsFactory = (
  txDb: AppDatabase,
  txLogger: LoggingClientContract,
  requestId: string,
) => AuthTxDepsContract;
