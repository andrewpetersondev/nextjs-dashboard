import "server-only";

import type { Database } from "@/server/db/connection";
import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/server/revenues/domain/entities/entity";
import type { Period } from "@/shared/brands/domain-brands";
import { toPeriod } from "@/shared/brands/mappers";
import { ValidationError } from "@/shared/errors/domain";
import { upsertRevenue } from "./upsert";

export async function upsertRevenueByPeriod(
  db: Database,
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
    updatedAt: now,
  };

  return await upsertRevenue(db, payload);
}
