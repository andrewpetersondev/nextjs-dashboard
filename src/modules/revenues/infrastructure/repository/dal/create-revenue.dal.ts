import "server-only";

import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { AppDatabase } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/factories/app-error.factory";
import { upsertRevenueDal } from "./upsert-revenue.dal";

/**
 * Creates a new revenue record in the database.
 * @param db - The database connection.
 * @param revenue - The revenue data to create.
 * @returns The created revenue entity.
 * @throws Error if revenue data is invalid.
 */
export async function createRevenueDal(
  db: AppDatabase,
  revenue: RevenueCreateEntity,
): Promise<RevenueEntity> {
  if (!revenue) {
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: "",
      message: "Revenue data is required",
      metadata: {},
    });
  }
  return await upsertRevenueDal(db, revenue);
}
