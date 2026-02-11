import "server-only";

import { and, desc, gte, lte } from "drizzle-orm";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import { mapRevenueRowsToEntities } from "@/modules/revenues/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import type { Period } from "@/shared/branding/brands";
import { toPeriod } from "@/shared/branding/converters/id-converters";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import {
  makeAppError,
  makeUnexpectedError,
} from "@/shared/core/errors/factories/app-error.factory";

/**
 * Finds revenue records within a date range.
 * @param db - The database connection.
 * @param endPeriod - The end period.
 * @param startPeriod - The start period.
 * @returns Array of revenue entities.
 * @throws Error if periods are invalid or retrieval fails.
 */
export async function findRevenuesByDateRangeDal(
  db: AppDatabase,
  startPeriod: Period,
  endPeriod: Period,
): Promise<RevenueEntity[]> {
  if (!(startPeriod && endPeriod)) {
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: "",
      message: "Start and end periods are required",
      metadata: {},
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
    throw makeUnexpectedError("", {
      message: "Failed to retrieve revenue records",
      overrideMetadata: { table: "revenues" },
    });
  }

  return mapRevenueRowsToEntities(revenueRows);
}
