import "server-only";

import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import { AuthUnitOfWorkAdapter } from "@/modules/auth/infrastructure/persistence/unit-of-work/auth-unit-of-work.adapter";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createUnitOfWork(
  db: AppDatabase,
  logger: LoggingClientContract,
  requestId: string,
): AuthUnitOfWorkContract {
  return new AuthUnitOfWorkAdapter(db, logger, requestId);
}
