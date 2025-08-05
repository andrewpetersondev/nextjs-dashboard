/**
 * Template utility functions for revenue data.
 *
 * This file contains functions for creating and manipulating templates
 * used to ensure complete data sets for revenue reporting.
 */

import "server-only";

import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/features/revenues/core/revenue.entity";
import { mapRevEntToRevDisplayEnt } from "@/features/revenues/core/revenue.mapper";
import {
  MONTH_ORDER,
  type RollingMonthData,
} from "@/features/revenues/core/revenue.types";
import { generateLookupKey } from "@/features/revenues/utils/data/lookup.utils";
import { toPeriod, toRevenueId } from "@/lib/definitions/brands";

/**
 * Creates a default month data structure for months without revenue.
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
  const period = `${year}-${String(monthNumber).padStart(2, "0")}`;
  // Create a default RevenueEntity and then transform it to RevenueDisplayEntity
  const defaultEntity: RevenueEntity = {
    calculationSource: "template",
    createdAt: new Date(),
    id: toRevenueId(`template-${period}`),
    invoiceCount: 0,
    period: toPeriod(period),
    revenue: 0,
    updatedAt: new Date(),
  };

  return mapRevEntToRevDisplayEnt(defaultEntity);
}

/**
 * Creates default revenue display entity for a specific period.
 * This function creates a RevenueDisplayEntity object by first creating a default
 * RevenueEntity and then transforming it using the factory method.
 * Use createDefaultRevenueEntity if you need a database-compatible entity.
 *
 * @param period - Period in YYYY-MM format
 * @returns Complete RevenueDisplayEntity with default values
 */
export function createDefaultRevenueData(period: string): RevenueDisplayEntity {
  // Create a default RevenueEntity
  const defaultEntity: RevenueEntity = {
    calculationSource: "template",
    createdAt: new Date(),
    id: toRevenueId(`template-${period}`),
    invoiceCount: 0,
    period: toPeriod(period),
    revenue: 0,
    updatedAt: new Date(),
  };

  // Transform to RevenueDisplayEntity using the factory method
  return mapRevEntToRevDisplayEnt(defaultEntity);
}

/**
 * Retrieves existing revenue data for a month or creates default empty data.
 *
 * Ensures consistent data structure across all 12 months by providing
 * zero-value defaults for months without revenue data.
 *
 * @param monthTemplate - Template data for the target month
 * @param dataLookup - Map containing actual revenue data
 * @returns Complete monthly revenue data (actual or default)
 */
export function getMonthDataOrDefault(
  monthTemplate: RollingMonthData,
  dataLookup: Map<string, RevenueDisplayEntity>,
): RevenueDisplayEntity {
  const { year, monthNumber, month } = monthTemplate;
  const lookupKey = generateLookupKey(year, monthNumber);
  const existingData = dataLookup.get(lookupKey);

  if (existingData) {
    return existingData;
  }

  return createDefaultMonthData(month, monthNumber, year);
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

  return {
    displayOrder,
    month: monthName,
    monthNumber: calendarMonthIndex + 1,
    year: monthDate.getFullYear(),
  };
}
