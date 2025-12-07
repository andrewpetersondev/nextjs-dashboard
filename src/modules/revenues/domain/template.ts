import { MONTH_ORDER } from "@/modules/revenues/domain/constants";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/entity";
import type { RevenueDisplayEntity } from "@/modules/revenues/domain/entities/entity.client";
import type { RollingMonthData } from "@/modules/revenues/domain/types";
import { mapRevenueEntityToDisplayEntity } from "@/modules/revenues/server/application/mappers/revenue-display.mapper";
import type { Period } from "@/shared/branding/brands";
import {
  toPeriod,
  toRevenueId,
} from "@/shared/branding/converters/id-converters";

/**
 * Creates month template data with validated month name lookup.
 * Client-safe equivalent for features.
 */
export function createMonthTemplateData(
  displayOrder: number,
  monthDate: Date,
  calendarMonthIndex: number,
): RollingMonthData {
  const monthName = MONTH_ORDER[calendarMonthIndex];
  if (!monthName) {
    throw new Error(
      `Invalid month index: ${calendarMonthIndex}. Expected 0-11.`,
    );
  }

  const monthNumber = calendarMonthIndex + 1;
  const year = monthDate.getFullYear();
  const period = toPeriod(`${year}-${String(monthNumber).padStart(2, "0")}`);

  return {
    displayOrder,
    month: monthName,
    monthNumber,
    period,
    year,
  };
}

/**
 * Internal helper: construct a default RevenueEntity for a given period.
 * DRY: used by default month and default period creators.
 */
export function makeDefaultRevenueEntity(p: Period): RevenueEntity {
  return {
    calculationSource: "template",
    createdAt: new Date(),
    id: toRevenueId(crypto.randomUUID()),
    invoiceCount: 0,
    period: toPeriod(p),
    totalAmount: 0,
    totalPaidAmount: 0,
    totalPendingAmount: 0,
    updatedAt: new Date(),
  };
}

/**
 * Creates a default revenue display entity for a specific period.
 * This function creates a RevenueDisplayEntity object by first creating a default
 * RevenueEntity and then transforming it using the factory method.
 * Use createDefaultRevenueEntity if you need a database-compatible entity.
 *
 * @param period - Branded Period (first-of-month Date)
 * @returns Complete RevenueDisplayEntity with default values
 */
export function createDefaultRevenueData(period: Period): RevenueDisplayEntity {
  // Create a default RevenueEntity
  const defaultEntity: RevenueEntity = makeDefaultRevenueEntity(period);

  // Transform to RevenueDisplayEntity using the factory method
  const mappedData = mapRevenueEntityToDisplayEntity(defaultEntity);

  //  logger.info("createDefaultRevenueData", mappedData);

  return mappedData;
}
