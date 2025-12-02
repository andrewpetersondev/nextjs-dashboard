import "server-only";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import type {
  RevenueEntity,
  RevenueUpdatable,
} from "@/server/revenues/domain/entities/entity";
import { mapRevenueRowToEntity } from "@/server/revenues/infrastructure/mappers/revenue.mapper";
import type { RevenueId } from "@/shared/branding/brands";
import { AppError } from "@/shared/errors/core/app-error.class";

export async function updateRevenue(
  db: AppDatabase,
  id: RevenueId,
  revenue: RevenueUpdatable,
): Promise<RevenueEntity> {
  if (!(id && revenue)) {
    throw new AppError("validation", {
      message: "Revenue ID and data are required",
    });
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
    throw new AppError("database", {
      message: "Failed to update revenue record",
    });
  }

  const result: RevenueEntity = mapRevenueRowToEntity(data);
  if (!result) {
    throw new AppError("database", {
      message: "Failed to convert updated revenue record",
    });
  }
  return result;
}
