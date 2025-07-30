import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/db/connection";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/db/models/revenue.entity";
import { revenues } from "@/db/schema";
import { DatabaseError, ValidationError } from "@/errors/errors";
import type {
  RevenueDto,
  SimpleRevenueDto,
} from "@/features/revenues/revenue.dto";
import {
  entityToRevenueDto,
  entityToSimpleDto,
  rawDbToRevenueEntity,
} from "@/features/revenues/revenue.mapper";
import { RevenueService } from "@/features/revenues/revenue.service";
import { MONTH_ORDER, type MonthName } from "@/features/revenues/revenue.types";
import { REVENUE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { RevenueId } from "@/lib/definitions/brands";

/**
 * Read a revenue entity by its ID from the database.
 * @param db - The database connection instance.
 * @param id - The ID of the revenue entity to read, branded as `RevenueId`.
 * @returns A promise that resolves to the `RevenueEntity` if found.
 * @throws {ValidationError} If the database connection or ID is not provided.
 * @throws {DatabaseError} If the revenue entity with the given ID does not exist in the database.
 */
export async function readRevenueDal(
  db: Database,
  id: RevenueId,
): Promise<RevenueEntity> {
  // Basic validation of parameters
  if (!db || !id) {
    throw new ValidationError(REVENUE_ERROR_MESSAGES.PARAMETER_ERROR, {
      db,
      id,
    });
  }

  // Fetch the revenue entity by ID
  const [data] = await db.select().from(revenues).where(eq(revenues.id, id));

  // Check if data exists
  if (!data) {
    throw new DatabaseError(REVENUE_ERROR_MESSAGES.DB_ERROR, { id });
  }

  // Convert the raw data to a RevenueEntity
  return rawDbToRevenueEntity(data);
}

export async function fetchRevenue(
  db: Database,
  year?: number,
): Promise<RevenueDto[]> {
  const revenueService = new RevenueService(db);
  const targetYear = year || new Date().getFullYear();

  try {
    const revenueEntities = await revenueService.getRevenueForYear(targetYear);

    const sortedRevenue = revenueEntities.sort(
      (a, b) =>
        MONTH_ORDER.indexOf(a.month as MonthName) -
        MONTH_ORDER.indexOf(b.month as MonthName),
    );

    return sortedRevenue.map(entityToRevenueDto);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error(`Failed to fetch revenue data for year ${targetYear}.`);
  }
}

export async function fetchSimpleRevenue(
  db: Database,
  year?: number,
): Promise<SimpleRevenueDto[]> {
  const revenueService = new RevenueService(db);
  const targetYear = year || new Date().getFullYear();

  try {
    const revenueEntities = await revenueService.getRevenueForYear(targetYear);

    const sortedRevenue = revenueEntities.sort(
      (a, b) =>
        MONTH_ORDER.indexOf(a.month as MonthName) -
        MONTH_ORDER.indexOf(b.month as MonthName),
    );

    return sortedRevenue.map(entityToSimpleDto);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch simple revenue data.");
  }
}

export async function recalculateRevenue(
  db: Database,
  year?: number,
): Promise<RevenueDto[]> {
  const revenueService = new RevenueService(db);
  const targetYear = year || new Date().getFullYear();

  try {
    const revenueEntities =
      await revenueService.recalculateRevenueForYear(targetYear);

    const sortedRevenue = revenueEntities.sort(
      (a, b) =>
        MONTH_ORDER.indexOf(a.month as MonthName) -
        MONTH_ORDER.indexOf(b.month as MonthName),
    );

    return sortedRevenue.map(entityToRevenueDto);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error(
      `Failed to recalculate revenue data for year ${targetYear}.`,
    );
  }
}
