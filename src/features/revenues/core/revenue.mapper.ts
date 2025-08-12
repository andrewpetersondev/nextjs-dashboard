import "server-only";

import type { RevenueRow } from "@/db/schema";
import { ValidationError } from "@/errors/errors";
import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/features/revenues/core/revenue.entity";
import { toRevenueSource } from "@/features/revenues/core/revenue.types";
import { extractMonthNumberFromPeriod } from "@/features/revenues/utils/date/period.utils";

/**
 * Maps a raw revenue row from the database to a RevenueEntity object.
 */
export function mapRevRowToRevEnt(row: RevenueRow): RevenueEntity {
  if (!row || typeof row !== "object") {
    throw new ValidationError("Invalid revenue row data");
  }
  return {
    calculationSource: toRevenueSource(row.calculationSource),
    createdAt: row.createdAt,
    id: row.id,
    invoiceCount: row.invoiceCount,
    period: row.period,
    revenue: row.revenue,
    updatedAt: row.updatedAt,
  };
}

/**
 * Maps an array of raw revenue rows to an array of RevenueEntity objects.
 */
export function mapRevenueRowsToEntities(rows: RevenueRow[]): RevenueEntity[] {
  if (!Array.isArray(rows)) {
    throw new ValidationError("Invalid revenue rows data");
  }
  return rows.map((row) => mapRevRowToRevEnt(row));
}

/**
 * Maps RevenueEntity to RevenueDisplayEntity
 */
export function mapRevEntToRevDisplayEnt(
  entity: RevenueEntity,
): RevenueDisplayEntity {
  const monthNumber = extractMonthNumberFromPeriod(entity.period);
  const yearNumber = parseInt(entity.period.substring(0, 4), 10);
  return {
    ...entity,
    month: entity.period.substring(5, 7),
    monthNumber,
    year: yearNumber,
  };
}
