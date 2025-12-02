// src/server/auth/infrastructure/repository/dal/demo-user-counter.ts
import "server-only";
import type { UserRole } from "@/features/auth/domain/auth.roles";
import { AuthLog, logAuth } from "@/features/auth/domain/logging/auth-log";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import type { AppDatabase } from "@/server/db/db.connection";
import { demoUserCounters } from "@/server/db/schema/demo-users";
import { makeIntegrityError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

/**
 * Increments and retrieves the demo user counter for a given role.
 * Ensures the returned value is a valid number.
 * @param db - The database instance (Drizzle)
 * @param role - The branded UserRole
 * @param logger - The logging client
 * @param requestId - Optional request ID for logging context
 * @returns The new counter value as a number
 */
export async function demoUserCounter(
  db: AppDatabase,
  role: UserRole,
  logger: LoggingClientContract,
  requestId?: string,
): Promise<number> {
  return await executeDalOrThrow(
    async () => {
      const [counterRow] = await db
        .insert(demoUserCounters)
        .values({ count: 1, role })
        .returning();

      if (!counterRow) {
        logAuth(
          "error",
          "Invariant failed: demoUserCounter did not return row",
          AuthLog.dal.demoUserCounter.error(new Error("row_missing"), { role }),
          { requestId },
        );
        throw makeIntegrityError({
          message: "Invariant: insert did not return a row",
          metadata: { kind: "invariant" },
        });
      }

      if (counterRow.id == null) {
        logAuth(
          "error",
          "Invalid counter row returned: missing id",
          AuthLog.dal.demoUserCounter.error(new Error("missing_id"), { role }),
          { additionalData: { counterRow }, requestId },
        );
        throw makeIntegrityError({
          message: "Invariant: demo user counter row returned with null id",
          metadata: { counterRow, kind: "invariant" },
        });
      }

      logAuth(
        "info",
        "Demo user counter created for role",
        AuthLog.dal.demoUserCounter.success({ role }),
        { additionalData: { count: counterRow.id }, requestId },
      );

      return counterRow.id;
    },
    { identifiers: { role }, operation: "demoUserCounter" },
    logger,
  );
}
