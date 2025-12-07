import "server-only";
import { eq } from "drizzle-orm";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import { mapRevenueRowToEntity } from "@/modules/revenues/server/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { type RevenueRow, revenues } from "@/server-core/db/schema/revenues";
import type { RevenueId } from "@/shared/branding/brands";
import {
  makeDatabaseError,
  makeValidationError,
} from "@/shared/errors/factories/app-error.factory";

/**
 * Reads a revenue record by ID.
 * @param db - The database connection.
 * @param id - The revenue ID.
 * @returns The revenue entity.
 * @throws Error if ID is invalid or record not found.
 */
export async function readRevenue(
  db: AppDatabase,
  id: RevenueId,
): Promise<RevenueEntity> {
  if (!id) {
    throw makeValidationError({
      message: "Revenue ID is required",
    });
  }

  const data: RevenueRow | undefined = await db
    .select()
    .from(revenues)
    .where(eq(revenues.id, id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!data) {
    throw makeDatabaseError({
      message: "Revenue record not found",
    });
  }

  const result: RevenueEntity = mapRevenueRowToEntity(data);
  if (!result) {
    throw makeDatabaseError({
      message: "Failed to convert revenue record",
    });
  }
  return result;
}
