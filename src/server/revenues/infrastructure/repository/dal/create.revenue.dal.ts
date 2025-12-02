import "server-only";
import type { AppDatabase } from "@/server/db/db.connection";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/server/revenues/domain/entities/entity";
import { AppError } from "@/shared/infrastructure/errors/core/app-error.class";
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
