import "server-only";
import type { AppDatabase } from "@/server/db/db.connection";
import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/server/revenues/domain/entities/entity";
import { ValidationError } from "@/shared/core/errors/base-error.subclasses";
import type { Period } from "@/shared/domain/domain-brands";
import { toPeriod } from "@/shared/domain/id-converters";
import { upsertRevenue } from "./upsert.revenue.dal";

export async function upsertRevenueByPeriod(
  db: AppDatabase,
  period: Period,
  revenue: RevenueUpdatable,
): Promise<RevenueEntity> {
  if (!period) {
    throw new ValidationError("Period is required");
  }
  if (!revenue) {
    throw new ValidationError("Revenue data is required");
  }

  const now = new Date();
  const payload: RevenueCreateEntity = {
    calculationSource: revenue.calculationSource,
    createdAt: now,
    invoiceCount: revenue.invoiceCount,
    period: toPeriod(period),
    totalAmount: revenue.totalAmount,
    totalPaidAmount: revenue.totalPaidAmount,
    totalPendingAmount: revenue.totalPendingAmount,
    updatedAt: now,
  };

  return await upsertRevenue(db, payload);
}
