import "server-only";
import { and, desc, gte, lte } from "drizzle-orm";
import type { RevenueEntity } from "@/modules/revenues/server/domain/entities/entity";
import { mapRevenueRowsToEntities } from "@/modules/revenues/server/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { type RevenueRow, revenues } from "@/server-core/db/schema/revenues";
import type { Period } from "@/shared/branding/brands";
import { toPeriod } from "@/shared/branding/converters/id-converters";
import { AppError } from "@/shared/errors/core/app-error.class";

export async function findRevenuesByDateRange(
  db: AppDatabase,
  startPeriod: Period,
  endPeriod: Period,
): Promise<RevenueEntity[]> {
  if (!(startPeriod && endPeriod)) {
    throw new AppError("validation", {
      message: "Start and end periods are required",
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
    throw new AppError("database", {
      message: "Failed to retrieve revenue records",
    });
  }

  return mapRevenueRowsToEntities(revenueRows);
}
