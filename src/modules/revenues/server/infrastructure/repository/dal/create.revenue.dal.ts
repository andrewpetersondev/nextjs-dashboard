import "server-only";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { AppError } from "@/shared/errors/core/app-error.class";
import { upsertRevenue } from "./upsert.revenue.dal";

export async function createRevenue(
  db: AppDatabase,
  revenue: RevenueCreateEntity,
): Promise<RevenueEntity> {
  if (!revenue) {
    throw new AppError("validation", { message: "Revenue data is required" });
  }
  return await upsertRevenue(db, revenue);
}
