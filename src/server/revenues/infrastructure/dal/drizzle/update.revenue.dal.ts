import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import { DatabaseError } from "@/server/errors/infrastructure";
import type {
  RevenueEntity,
  RevenueUpdatable,
} from "@/server/revenues/domain/entities/entity";
import { mapRevenueRowToEntity } from "@/server/revenues/infrastructure/mappers/revenue.mapper";
import { ValidationError } from "@/shared/core/errors/domain";
import type { RevenueId } from "@/shared/domain/domain-brands";

export async function updateRevenue(
  db: Database,
  id: RevenueId,
  revenue: RevenueUpdatable,
): Promise<RevenueEntity> {
  if (!id || !revenue) {
    throw new ValidationError("Revenue ID and data are required");
  }

  const now = new Date();

  const [data] = (await db
    .update(revenues)
    .set({
      calculationSource: revenue.calculationSource,
      invoiceCount: revenue.invoiceCount,
      totalAmount: revenue.totalAmount,
      totalPaidAmount: revenue.totalPaidAmount,
      totalPendingAmount: revenue.totalPendingAmount,
      updatedAt: now,
    })
    .where(eq(revenues.id, id))
    .returning()) as RevenueRow[];

  if (!data) {
    throw new DatabaseError("Failed to update revenue record");
  }

  const result: RevenueEntity = mapRevenueRowToEntity(data);
  if (!result) {
    throw new DatabaseError("Failed to convert updated revenue record");
  }
  return result;
}
