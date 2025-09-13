import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import { mapRevenueRowToEntity } from "@/server/revenues/infrastructure/mappers/revenue.mapper";
import { ValidationError } from "@/shared/core/errors/domain";
import type { Period } from "@/shared/domain/domain-brands";
import { toPeriod } from "@/shared/domain/id-converters";
import {
  type RevenueRow,
  revenues,
} from "../../../../../../node-only/schema/revenues";

export async function findRevenueByPeriod(
  db: Database,
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
