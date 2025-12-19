import "server-only";
import { and, desc, gte, lte } from "drizzle-orm";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import { mapRevenueRowsToEntities } from "@/modules/revenues/server/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import type { Period } from "@/shared/branding/brands";
import { toPeriod } from "@/shared/branding/converters/id-converters";
import {
  makeDatabaseError,
  makeValidationError,
} from "@/shared/errors/factories/app-error.factory";

/**
 * Finds revenue records within a date range.
 * @param db - The database connection.
 * @param endPeriod - The end period.
 * @param startPeriod - The start period.
 * @returns Array of revenue entities.
 * @throws Error if periods are invalid or retrieval fails.
 */
export async function findRevenuesByDateRange(
  db: AppDatabase,
  startPeriod: Period,
  endPeriod: Period,
): Promise<RevenueEntity[]> {
  if (!(startPeriod && endPeriod)) {
    throw makeValidationError({
      message: "Start and end periods are required",
      metadata: { endPeriod, startPeriod },
    });
  }

  const revenueRows = (await db
    .select()
    .from(revenues)
    .where(
      and(
        gte(revenues.period, toPeriod(startPeriod)),
        lte(revenues.period, toPeriod(endPeriod)),
      ),
    )
    .orderBy(desc(revenues.period))) as RevenueRow[];

  if (!revenueRows) {
    throw makeDatabaseError({
      message: "Failed to retrieve revenue records",
      metadata: { table: "revenues" },
    });
  }

  return mapRevenueRowsToEntities(revenueRows);
}
