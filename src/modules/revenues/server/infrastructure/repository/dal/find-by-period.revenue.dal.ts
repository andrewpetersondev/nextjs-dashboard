import "server-only";
import { eq } from "drizzle-orm";
import type { RevenueEntity } from "@/modules/revenues/server/domain/entities/entity";
import { mapRevenueRowToEntity } from "@/modules/revenues/server/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import type { Period } from "@/shared/branding/brands";
import { toPeriod } from "@/shared/branding/converters/id-converters";
import { AppError } from "@/shared/errors/core/app-error.class";

export async function findRevenueByPeriod(
  db: AppDatabase,
  period: Period,
): Promise<RevenueEntity | null> {
  if (!period) {
    throw new AppError("validation", { message: "Period is required" });
  }

  const data: RevenueRow | undefined = await db
    .select()
    .from(revenues)
    .where(eq(revenues.period, toPeriod(period)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!data) {
    return null;
  }

  const result: RevenueEntity = mapRevenueRowToEntity(data);
  if (!result) {
    throw new AppError("database", {
      message: "Failed to convert revenue record",
    });
  }
  return result;
}
