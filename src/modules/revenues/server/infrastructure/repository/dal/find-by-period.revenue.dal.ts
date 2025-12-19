import "server-only";
import { eq } from "drizzle-orm";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import { mapRevenueRowToEntity } from "@/modules/revenues/server/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import type { Period } from "@/shared/branding/brands";
import { toPeriod } from "@/shared/branding/converters/id-converters";
import {
  makeDatabaseError,
  makeValidationError,
} from "@/shared/errors/factories/app-error.factory";

/**
 * Finds a revenue record by period.
 * @param db - The database connection.
 * @param period - The period to search for.
 * @returns The revenue entity or null if not found.
 * @throws Error if period is invalid or mapping fails.
 */
export async function findRevenueByPeriod(
  db: AppDatabase,
  period: Period,
): Promise<RevenueEntity | null> {
  if (!period) {
    throw makeValidationError({
      message: "Period is required",
      metadata: { period },
    });
  }

  const data: RevenueRow | undefined = await db
    .select()
    .from(revenues)
    .where(eq(revenues.period, toPeriod(period)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!data) {
    return null;
  }

  const result: RevenueEntity = mapRevenueRowToEntity(data);
  if (!result) {
    throw makeDatabaseError({
      message: "Failed to convert revenue record",
      metadata: { table: "revenues" },
    });
  }
  return result;
}
