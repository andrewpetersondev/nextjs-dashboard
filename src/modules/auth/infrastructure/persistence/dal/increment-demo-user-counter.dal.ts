import "server-only";
import type { AppDatabase } from "@/server/db/db.connection";
import { demoUserCounters } from "@/server/db/schema/demo-users";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { executeDalThrow } from "@/shared/errors/server/adapters/dal/execute-dal-throw";
import { PG_CODES } from "@/shared/errors/server/adapters/postgres/pg-codes";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Increments and retrieves the demo user counter for a given role.
 * Ensures the returned value is a valid number.
 *
 * @param db - Database connection
 * @param role - Demo user role
 * @param logger - Logging client
 * @returns Counter id as number
 */
export async function incrementDemoUserCounterDal(
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
            operationContext: "auth:dal",
            operationIdentifiers: { role },
            operationName: "demoUserCounter.invariant.rowMissing",
          },
        );

        throw makeAppError(APP_ERROR_KEYS.integrity, {
          cause: "",
          message: "Invariant: insert did not return a row",
          metadata: {
            pgCode: PG_CODES.INVARIANT_NO_ROWS_RETURNED,
          },
        });
      }

      if (counterRow.id == null) {
        logger.operation("error", "Invalid counter row returned: missing id", {
          error: new Error("missing_id"),
          operationContext: "auth:dal",
          operationIdentifiers: { role },
          operationName: "demoUserCounter.invariant.missingId",
        });

        throw makeAppError(APP_ERROR_KEYS.integrity, {
          cause: "",
          message: "Invariant: demo user counter row returned with null id",
          metadata: { pgCode: PG_CODES.INVARIANT_NO_ROWS_RETURNED },
        });
      }

      logger.operation("info", "Demo user counter created for role", {
        operationContext: "auth:dal",
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
