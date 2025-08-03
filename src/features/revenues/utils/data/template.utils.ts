/**
 * Template utility functions for revenue data.
 *
 * This file contains functions for creating and manipulating templates
 * used to ensure complete data sets for revenue reporting.
 */

import "server-only";

import type { RevenueDisplayEntity } from "@/features/revenues/core/revenue.entity";
import type { RollingMonthData } from "@/features/revenues/core/revenue.types";
import { MONTH_ORDER } from "@/features/revenues/core/revenue.types";
import { createDefaultMonthData } from "./entity.utils";
import { generateLookupKey } from "./lookup.utils";

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
