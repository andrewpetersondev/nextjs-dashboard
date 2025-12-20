import "server-only";

import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import { executeDalThrow } from "@/server/db/dal/execute-dal-throw";
import type { AppDatabase } from "@/server/db/db.connection";
import { demoUserCounters } from "@/server/db/schema/demo-users";
import { makeIntegrityError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

/**
 * Increments and retrieves the demo user counter for a given role.
 * Ensures the returned value is a valid number.
 *
 * @param db - Database connection
 * @param role - Demo user role
 * @param logger - Logging client
 * @returns Counter id as number
 */
export async function demoUserCounterDal(
  db: AppDatabase,
  role: UserRole,
  logger: LoggingClientContract,
): Promise<number> {
  return await executeDalThrow<number>(
    async (): Promise<number> => {
      const [counterRow] = await db
        .insert(demoUserCounters)
        .values({ count: 1, role })
        .returning();

      if (!counterRow) {
        logger.operation(
          "error",
          "Invariant failed: demoUserCounter did not return row",
          {
            error: new Error("row_missing"),
            operationIdentifiers: { role },
            operationName: "demoUserCounter.invariant.rowMissing",
          },
        );

        throw makeIntegrityError({
          cause: "",
          message: "Invariant: insert did not return a row",
          metadata: { kind: "invariant" },
        });
      }

      if (counterRow.id == null) {
        logger.operation("error", "Invalid counter row returned: missing id", {
          error: new Error("missing_id"),
          operationIdentifiers: { role },
          operationName: "demoUserCounter.invariant.missingId",
        });

        throw makeIntegrityError({
          cause: "",
          message: "Invariant: demo user counter row returned with null id",
          metadata: { counterRow, kind: "invariant" },
        });
      }

      logger.operation("info", "Demo user counter created for role", {
        operationIdentifiers: { count: counterRow.id, role },
        operationName: "demoUserCounter.success",
      });

      return counterRow.id;
    },
    {
      entity: "demoUserCounter",
      identifiers: { role },
      operation: "demoUserCounter",
    },
    logger,
    { operationContext: "auth:dal" },
  );
}
