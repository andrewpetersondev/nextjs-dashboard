import "server-only";

import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import { DatabaseError } from "@/server/errors/infrastructure";
import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import { mapRevenueRowToEntity } from "@/server/revenues/infrastructure/mappers/revenue.mapper";
import { ValidationError } from "@/shared/core/errors/domain/domain-error";
import type { RevenueId } from "@/shared/domain/domain-brands";

export async function readRevenue(
  db: AppDatabase,
  id: RevenueId,
): Promise<RevenueEntity> {
  if (!id) {
    throw new ValidationError("Revenue ID is required");
  }

  const data: RevenueRow | undefined = await db
    .select()
    .from(revenues)
    .where(eq(revenues.id, id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!data) {
    throw new DatabaseError("Revenue record not found");
  }

  const result: RevenueEntity = mapRevenueRowToEntity(data);
  if (!result) {
    throw new DatabaseError("Failed to convert revenue record");
  }
  return result;
}
