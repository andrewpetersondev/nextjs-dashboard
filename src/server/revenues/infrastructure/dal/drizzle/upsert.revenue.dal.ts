import "server-only";

import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import { DatabaseError } from "@/server/errors/infrastructure";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/server/revenues/domain/entities/entity";
import { mapRevenueRowToEntity } from "@/server/revenues/infrastructure/mappers/revenue.mapper";
import { ValidationError } from "@/shared/core/errors/domain/domain-error";

export async function upsertRevenue(
  db: AppDatabase,
  revenueData: RevenueCreateEntity,
): Promise<RevenueEntity> {
  if (!revenueData) {
    throw new ValidationError("Revenue data is required");
  }
  if (!revenueData.period) {
    throw new ValidationError(
      "Revenue period (first-of-month DATE) is required and must be unique",
    );
  }

  const now = new Date();

  try {
    const [data] = (await db
      .insert(revenues)
      .values({
        ...revenueData,
        createdAt: revenueData.createdAt || now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        set: {
          calculationSource: revenueData.calculationSource,
          invoiceCount: revenueData.invoiceCount,
          totalAmount: revenueData.totalAmount,
          totalPaidAmount: revenueData.totalPaidAmount,
          totalPendingAmount: revenueData.totalPendingAmount,
          updatedAt: now,
        },
        target: revenues.period,
      })
      .returning()) as RevenueRow[];

    if (!data) {
      throw new DatabaseError("Failed to upsert revenue record");
    }

    const result: RevenueEntity = mapRevenueRowToEntity(data);
    if (!result) {
      throw new DatabaseError("Failed to convert revenue record");
    }
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique constraint")) {
      throw new ValidationError(
        `Revenue record with period ${revenueData.period} already exists and could not be updated`,
      );
    }
    throw error;
  }
}
