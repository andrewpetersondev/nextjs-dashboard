import "server-only";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import { mapRevenueRowToEntity } from "@/server/revenues/infrastructure/mappers/revenue.mapper";
import type { Period } from "@/shared/branding/domain-brands";
import { toPeriod } from "@/shared/branding/id-converters";
import {
  DatabaseError,
  ValidationError,
} from "@/shared/errors/base-error.subclasses";

export async function findRevenueByPeriod(
  db: AppDatabase,
  period: Period,
): Promise<RevenueEntity | null> {
  if (!period) {
    throw new ValidationError("Period is required");
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
    throw new DatabaseError("Failed to convert revenue record");
  }
  return result;
}
