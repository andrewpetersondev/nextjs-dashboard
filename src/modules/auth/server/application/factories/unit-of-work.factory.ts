import "server-only";

import type { UnitOfWorkPort } from "@/modules/auth/server/application/ports/unit-of-work.port";
import { DbUnitOfWorkAdapter } from "@/modules/auth/server/infrastructure/db/adapters/unit-of-work.adapter";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

export function createUnitOfWorkFactory(
  db: AppDatabase,
  logger: LoggingClientPort,
  requestId: string,
): UnitOfWorkPort {
  return new DbUnitOfWorkAdapter(db, logger, requestId);
}
