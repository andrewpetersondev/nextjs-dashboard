import "server-only";

import { and, desc, gte, lte } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import { mapRevenueRowsToEntities } from "@/server/revenues/infrastructure/mappers/revenue.mapper";
import { ValidationError } from "@/shared/core/errors/domain/domain-errors";
import type { Period } from "@/shared/domain/domain-brands";
import { toPeriod } from "@/shared/domain/id-converters";

export async function findRevenuesByDateRange(
  db: AppDatabase,
  startPeriod: Period,
  endPeriod: Period,
): Promise<RevenueEntity[]> {
  if (!(startPeriod && endPeriod)) {
    throw new ValidationError("Start and end periods are required");
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
    throw new DatabaseError("Failed to retrieve revenue records");
  }

  return mapRevenueRowsToEntities(revenueRows);
}
