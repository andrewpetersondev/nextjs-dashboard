import "server-only";

import type { UnitOfWorkContract } from "@/modules/auth/application/contracts/unit-of-work.contract";
import { DrizzleUnitOfWorkAdapter } from "@/modules/auth/infrastructure/adapters/drizzle-unit-of-work.adapter";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createUnitOfWorkFactory(
  db: AppDatabase,
  logger: LoggingClientContract,
  requestId: string,
): UnitOfWorkContract {
  return new DrizzleUnitOfWorkAdapter(db, logger, requestId);
}
