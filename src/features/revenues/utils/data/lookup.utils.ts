/**
 * Lookup utility functions for revenue data.
 *
 * This file contains functions for creating and using lookup maps
 * to efficiently access revenue data by period.
 */

import "server-only";

import type { RevenueDisplayEntity } from "@/features/revenues/core/revenue.entity";

/**
 * Creates an efficient lookup map for revenue data indexed by year-month key.
 *
 * @param actualData - Array of revenue data from database query
 * @returns Map with year-month keys and corresponding revenue data
 *
 * @remarks
 * Time complexity: O(n) where n is the number of actual data records
 */
export function createDataLookupMap(
  actualData: RevenueDisplayEntity[],
): Map<string, RevenueDisplayEntity> {
  const dataMap = new Map<string, RevenueDisplayEntity>();

  actualData.forEach((dataItem) => {
    const { year, monthNumber } = dataItem;
    const lookupKey = generateLookupKey(year, monthNumber);
    dataMap.set(lookupKey, dataItem);
  });

  return dataMap;
}

/**
 * Generates a consistent lookup key for year-month combination.
 *
 * @param year - Four-digit year
 * @param monthNumber - Month number (1-12)
 * @returns Formatted key string in "YYYY-MM" format
 */
export function generateLookupKey(year: number, monthNumber: number): string {
  return `${year}-${String(monthNumber).padStart(2, "0")}`;
}
