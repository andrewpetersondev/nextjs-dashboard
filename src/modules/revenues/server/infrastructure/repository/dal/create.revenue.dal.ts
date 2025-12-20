import "server-only";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { AppDatabase } from "@/server/db/db.connection";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";
import { upsertRevenue } from "./upsert.revenue.dal";

/**
 * Creates a new revenue record in the database.
 * @param db - The database connection.
 * @param revenue - The revenue data to create.
 * @returns The created revenue entity.
 * @throws Error if revenue data is invalid.
 */
export async function createRevenue(
  db: AppDatabase,
  revenue: RevenueCreateEntity,
): Promise<RevenueEntity> {
  if (!revenue) {
    throw makeValidationError({
      cause: "",
      message: "Revenue data is required",
      metadata: { revenue },
    });
  }
  return await upsertRevenue(db, revenue);
}
