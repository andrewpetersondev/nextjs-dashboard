import "server-only";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/modules/revenues/domain/entities/entity";
import { mapRevenueRowToEntity } from "@/modules/revenues/server/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { type RevenueRow, revenues } from "@/server-core/db/schema/revenues";
import { AppError } from "@/shared/errors/core/app-error.class";

export async function upsertRevenue(
  db: AppDatabase,
  revenueData: RevenueCreateEntity,
): Promise<RevenueEntity> {
  if (!revenueData) {
    throw new AppError("validation", { message: "Revenue data is required" });
  }
  if (!revenueData.period) {
    throw new AppError("validation", {
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
      throw new AppError("database", {
        message: "Failed to upsert revenue record",
      });
    }

    const result: RevenueEntity = mapRevenueRowToEntity(data);
    if (!result) {
      throw new AppError("database", {
        message: "Failed to convert revenue record",
      });
    }
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique constraint")) {
      throw new AppError("validation", {
        message: `Revenue record with period ${revenueData.period} already exists and could not be updated`,
      });
    }
    throw error;
  }
}
