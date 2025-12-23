import "server-only";

import { eq } from "drizzle-orm";
import type {
  RevenueEntity,
  RevenueUpdatable,
} from "@/modules/revenues/domain/entities/revenue.entity";
import { mapRevenueRowToEntity } from "@/modules/revenues/server/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { type RevenueRow, revenues } from "@/server/db/schema/revenues";
import type { RevenueId } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import {
  makeAppError,
  makeUnexpectedError,
} from "@/shared/errors/factories/app-error.factory";

/**
 * Updates a revenue record.
 * @param db - The database connection.
 * @param id - The revenue ID.
 * @param revenue - The updatable fields.
 * @returns The updated revenue entity.
 * @throws Error if inputs are invalid or update fails.
 */
export async function updateRevenue(
  db: AppDatabase,
  id: RevenueId,
  revenue: RevenueUpdatable,
): Promise<RevenueEntity> {
  if (!(id && revenue)) {
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: "",
      message: "Revenue ID and data are required",
      metadata: {},
    });
  }

  const now = new Date();

  const [data] = (await db
    .update(revenues)
    .set({
      calculationSource: revenue.calculationSource,
      invoiceCount: revenue.invoiceCount,
      totalAmount: revenue.totalAmount,
      totalPaidAmount: revenue.totalPaidAmount,
      totalPendingAmount: revenue.totalPendingAmount,
      updatedAt: now,
    })
    .where(eq(revenues.id, id))
    .returning()) as RevenueRow[];

  if (!data) {
    throw makeUnexpectedError("", {
      key: APP_ERROR_KEYS.unexpected,
      message: "Failed to update revenue record",
      metadata: {},
    });
  }

  const result: RevenueEntity = mapRevenueRowToEntity(data);
  if (!result) {
    throw makeUnexpectedError("", {
      key: APP_ERROR_KEYS.unexpected,
      message: "Failed to convert updated revenue record",
      metadata: { table: "revenues" },
    });
  }
  return result;
}
