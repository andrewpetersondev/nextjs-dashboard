import { randomUUID } from "node:crypto";
import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/features/revenues/core/entity";
import {
  MONTH_ORDER,
  type RollingMonthData,
} from "@/features/revenues/core/types";
import { periodKey } from "@/features/revenues/utils/date/period";
import { logger } from "@/server/logging/logger";
import { mapRevenueEntityToDisplayEntity } from "@/server/mappers/revenue";
import {
  type Period,
  toPeriod,
  toRevenueId,
} from "@/shared/brands/domain-brands";

/**
 * Internal helper: construct a default RevenueEntity for a given period.
 * DRY: used by default month and default period creators.
 */
function makeDefaultRevenueEntity(p: Period): RevenueEntity {
  return {
    calculationSource: "template",
    createdAt: new Date(),
    id: toRevenueId(randomUUID()),
    invoiceCount: 0,
    period: toPeriod(p),
    totalAmount: 0,
    updatedAt: new Date(),
  };
}

/**
 * Creates a default month data structure for months without a revenue.
 *
 * Ensures type safety and consistent zero-value initialization for months
 * that don't have corresponding invoice data.
 *
 * @param _month - Month name (e.g., "Jan", "Feb")
 * @param monthNumber - Month number (1-12)
 * @param year - Four-digit year
 * @returns RevenueDisplayEntity with zero values
 */
function createDefaultMonthData(
  _month: string,
  monthNumber: number,
  year: number,
): RevenueDisplayEntity {
  const periodStr = `${year}-${String(monthNumber).padStart(2, "0")}`;
  const period = toPeriod(periodStr);
  // Create a default RevenueEntity and then transform it to RevenueDisplayEntity
  const defaultEntity = makeDefaultRevenueEntity(period);

  const mappedData = mapRevenueEntityToDisplayEntity(defaultEntity);

  logger.debug({
    context: "createDefaultMonthData",
    message: "Created default month data",
    period: periodStr,
  });

  return mappedData;
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

  logger.debug({
    context: "createDefaultRevenueData",
    message: "Created default revenue data",
    period,
  });

  return mappedData;
}

/**
 * Retrieves existing revenue data for a month or creates default empty data.
 *
 * Ensures a consistent data structure across all 12 months by providing
 * zero-value defaults for months without revenue data.
 *
 * @param monthTemplate - Template data for the target month
 * @param dataLookup - Map containing actual revenue data keyed by Period
 * @returns Complete monthly revenue data (actual or default)
 */
export function getMonthDataOrDefault(
  monthTemplate: RollingMonthData,
  dataLookup: Map<string, RevenueDisplayEntity>,
): RevenueDisplayEntity {
  const { year, monthNumber, month, period } = monthTemplate;
  const existingData = dataLookup.get(periodKey(period));

  if (existingData) {
    return existingData;
  }

  const defaultData = createDefaultMonthData(month, monthNumber, year);

  logger.debug({
    context: "getMonthDataOrDefault",
    message: "Created default data for missing month",
    monthNumber,
    period,
    year,
  });

  return defaultData;
}

/**
 * Creates month template data with validated month name lookup.
 *
 * @param displayOrder - Display order in the 12-month sequence (0-11)
 * @param monthDate - Date object for the specific month
 * @param calendarMonthIndex - Zero-based month index (0-11)
 * @returns RollingMonthData object with all required fields
 *
 * @throws {Error} When calendarMonthIndex is outside valid range (0-11)
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

  const data: RollingMonthData = {
    displayOrder,
    month: monthName,
    monthNumber,
    period,
    year,
  };

  logger.debug({
    context: "createMonthTemplateData",
    displayOrder,
    message: "Created month template data",
    month: monthName,
    monthNumber,
    year,
  });

  return data;
}
