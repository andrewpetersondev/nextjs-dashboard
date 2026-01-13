import "server-only";

import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import { DrizzleAuthUnitOfWorkAdapter } from "@/modules/auth/infrastructure/adapters/drizzle-auth-unit-of-work.adapter";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createUnitOfWork(
  db: AppDatabase,
  logger: LoggingClientContract,
  requestId: string,
): AuthUnitOfWorkContract {
  return new DrizzleAuthUnitOfWorkAdapter(db, logger, requestId);
}
