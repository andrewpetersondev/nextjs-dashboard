import "server-only";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/modules/revenues/domain/entities/revenue.entity";
import { mapRevenueRowToEntity } from "@/modules/revenues/server/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import {
  makeDatabaseError,
  makeValidationError,
} from "@/shared/errors/factories/app-error.factory";

/**
 * Upserts a revenue record.
 * @param db - The database connection.
 * @param revenueData - The revenue data.
 * @returns The upserted revenue entity.
 * @throws Error if inputs are invalid or upsert fails.
 */
export async function upsertRevenue(
  db: AppDatabase,
  revenueData: RevenueCreateEntity,
): Promise<RevenueEntity> {
  if (!revenueData) {
    throw makeValidationError({
      cause: "",
      message: "Revenue data is required",
      metadata: { revenueData },
    });
  }
  if (!revenueData.period) {
    throw makeValidationError({
      cause: "",
      message:
        "Revenue period (first-of-month DATE) is required and must be unique",
      metadata: { revenueData },
    });
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
      throw makeDatabaseError({
        cause: "",
        message: "Failed to upsert revenue record",
        metadata: { table: "revenues" },
      });
    }
    const result: RevenueEntity = mapRevenueRowToEntity(data);
    if (!result) {
      throw makeDatabaseError({
        cause: "",
        message: "Failed to convert revenue record",
        metadata: { table: "revenues" },
      });
    }
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique constraint")) {
      throw makeValidationError({
        cause: "",
        message: `Revenue record with period ${revenueData.period} already exists and could not be updated`,
        metadata: { revenueData: revenueData ?? "null" },
      });
    }
    throw error;
  }
}
