import "server-only";

import type { Database } from "@/server/db/connection";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/server/revenues/domain/entities/entity";
import { ValidationError } from "@/shared/core/errors/domain";
import { upsertRevenue } from "./upsert.revenue.dal";

export async function createRevenue(
  db: Database,
  revenue: RevenueCreateEntity,
): Promise<RevenueEntity> {
  if (!revenue) {
    throw new ValidationError("Revenue data is required");
  }
  return await upsertRevenue(db, revenue);
}
