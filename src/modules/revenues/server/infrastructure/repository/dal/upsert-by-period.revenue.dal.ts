import "server-only";
import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/modules/revenues/domain/entities/entity";
import type { AppDatabase } from "@/server-core/db/db.connection";
import type { Period } from "@/shared/branding/brands";
import { toPeriod } from "@/shared/branding/converters/id-converters";
import { AppError } from "@/shared/errors/core/app-error.class";
import { upsertRevenue } from "./upsert.revenue.dal";

export async function upsertRevenueByPeriod(
  db: AppDatabase,
  period: Period,
  revenue: RevenueUpdatable,
): Promise<RevenueEntity> {
  if (!period) {
    throw new AppError("validation", { message: "Period is required" });
  }
  if (!revenue) {
    throw new AppError("validation", { message: "Revenue data is required" });
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
