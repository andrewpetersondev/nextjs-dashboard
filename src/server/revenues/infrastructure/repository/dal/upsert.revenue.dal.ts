import "server-only";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/server/revenues/domain/entities/entity";
import { mapRevenueRowToEntity } from "@/server/revenues/infrastructure/mappers/revenue.mapper";
import { BaseError } from "@/shared/errors/base-error";

export async function upsertRevenue(
  db: AppDatabase,
  revenueData: RevenueCreateEntity,
): Promise<RevenueEntity> {
  if (!revenueData) {
    throw new BaseError("validation", { message: "Revenue data is required" });
  }
  if (!revenueData.period) {
    throw new BaseError("validation", {
      message:
        "Revenue period (first-of-month DATE) is required and must be unique",
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
      throw new BaseError("database", {
        message: "Failed to upsert revenue record",
      });
    }

    const result: RevenueEntity = mapRevenueRowToEntity(data);
    if (!result) {
      throw new BaseError("database", {
        message: "Failed to convert revenue record",
      });
    }
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique constraint")) {
      throw new BaseError("validation", {
        message: `Revenue record with period ${revenueData.period} already exists and could not be updated`,
      });
    }
    throw error;
  }
}
