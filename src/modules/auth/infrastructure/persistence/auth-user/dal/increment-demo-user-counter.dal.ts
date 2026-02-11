import "server-only";
import type { AppDatabase } from "@/server/db/db.connection";
import { demoUserCounters } from "@/server/db/schema/demo-users";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { normalizePgError } from "@/shared/errors/server/adapters/postgres/normalize-pg-error";
import { PG_CODES } from "@/shared/errors/server/adapters/postgres/pg-codes";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import type { UserRole } from "@/shared/validation/user-role/user-role.constants";

/**
 * Increments and retrieves the demo user counter for a given role.
 *
 * @remarks
 * Returns Result so callers can propagate failures explicitly.
 *
 * @param db - Database connection.
 * @param role - Demo user role.
 * @param logger - Logging client.
 * @returns Result containing the counter id, or AppError.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: close enough
export async function incrementDemoUserCounterDal(
  db: AppDatabase,
  role: UserRole,
  logger: LoggingClientContract,
): Promise<Result<number, AppError>> {
  try {
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

      return Err(
        makeAppError(APP_ERROR_KEYS.integrity, {
          cause: "row_missing",
          message: "Invariant: insert did not return a row",
          metadata: { pgCode: PG_CODES.INVARIANT_NO_ROWS_RETURNED },
        }),
      );
    }

    // biome-ignore lint/nursery/noEqualsToNull: fix
    if (counterRow.id == null) {
      logger.operation("error", "Invalid counter row returned: missing id", {
        error: new Error("missing_id"),
        operationContext: "auth:dal",
        operationIdentifiers: { role },
        operationName: "demoUserCounter.invariant.missingId",
      });

      return Err(
        makeAppError(APP_ERROR_KEYS.integrity, {
          cause: "missing_id",
          message: "Invariant: demo user counter row returned with null id",
          metadata: { pgCode: PG_CODES.INVARIANT_NO_ROWS_RETURNED },
        }),
      );
    }

    logger.operation("info", "Demo user counter created for role", {
      operationContext: "auth:dal",
      operationIdentifiers: { count: counterRow.id, role },
      operationName: "demoUserCounter.success",
    });

    return Ok(counterRow.id);
  } catch (err: unknown) {
    const error = normalizePgError(err);

    logger.operation("error", "demoUserCounter.failed", {
      error,
      operationContext: "auth:dal",
      operationIdentifiers: { role },
      operationName: "demoUserCounter",
    });

    return Err(error);
  }
}
