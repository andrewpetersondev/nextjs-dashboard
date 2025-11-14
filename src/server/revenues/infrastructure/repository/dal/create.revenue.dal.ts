import "server-only";
import type { AppDatabase } from "@/server/db/db.connection";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/server/revenues/domain/entities/entity";
import { ValidationError } from "@/shared/core/errors/domain/base-error.subclasses";
import { upsertRevenue } from "./upsert.revenue.dal";

export async function createRevenue(
  db: AppDatabase,
  revenue: RevenueCreateEntity,
): Promise<RevenueEntity> {
  if (!revenue) {
    throw new ValidationError("Revenue data is required");
  }
  return await upsertRevenue(db, revenue);
}
