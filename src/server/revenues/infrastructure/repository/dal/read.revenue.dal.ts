import "server-only";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import { mapRevenueRowToEntity } from "@/server/revenues/infrastructure/mappers/revenue.mapper";
import type { RevenueId } from "@/shared/branding/domain-brands";
import { AppError } from "@/shared/errors/core/app-error.class";

export async function readRevenue(
  db: AppDatabase,
  id: RevenueId,
): Promise<RevenueEntity> {
  if (!id) {
    throw new AppError("validation", { message: "Revenue ID is required" });
  }

  const data: RevenueRow | undefined = await db
    .select()
    .from(revenues)
    .where(eq(revenues.id, id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!data) {
    throw new AppError("database", { message: "Revenue record not found" });
  }

  const result: RevenueEntity = mapRevenueRowToEntity(data);
  if (!result) {
    throw new AppError("database", {
      message: "Failed to convert revenue record",
    });
  }
  return result;
}
