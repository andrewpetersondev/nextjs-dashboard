/**
 * Core data utility functions for revenue calculations.
 *
 * This file contains the fundamental data manipulation functions used
 * across the revenue feature, focusing on data lookup and transformation.
 */

import "server-only";

import type { RevenueDisplayEntity } from "@/features/revenues/core/revenue.entity";
import type {
  RevenueStatistics,
  RollingMonthData,
} from "@/features/revenues/core/revenue.types";
import { createDataLookupMap } from "@/features/revenues/utils/data/lookup.utils";
import { getMonthDataOrDefault } from "@/features/revenues/utils/data/template.utils";
import { logger } from "@/lib/utils/logger";

/**
 * Creates an empty statistics object when no revenue data exists.
 *
 * @returns RevenueStatistics object with all zero values
 */
export function createEmptyStatistics(): RevenueStatistics {
  return {
    average: 0,
    maximum: 0,
    minimum: 0,
    monthsWithData: 0,
    total: 0,
  };
}

/**
 * Merges actual revenue data with month template to ensure complete 12-month dataset.
 *
 * Uses an efficient lookup strategy with O(1) data retrieval via Map-based lookup
 * and template-driven completion to fill missing months with zero values.
 *
 * @param actualData - Array of actual revenue data from database
 * @param template - Array of 12 month templates
 * @returns Array of 12 complete revenue display entities
 */
export function mergeDataWithTemplate(
  actualData: RevenueDisplayEntity[],
  template: RollingMonthData[],
): RevenueDisplayEntity[] {
  const dataLookup = createDataLookupMap(actualData);

  const mergedData = template.map((monthTemplate) =>
    getMonthDataOrDefault(monthTemplate, dataLookup),
  );

  logger.debug({
    context: "mergeDataWithTemplate",
    mergedDataCount: mergedData.length,
    message: "Merged actual data with a template",
  });

  return mergedData;
}
