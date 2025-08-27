import { createDataLookupMap } from "@/features/revenues/lib/data/lookup";
import { getMonthDataOrDefault } from "@/features/revenues/lib/template";
import type {
  RevenueDisplayRow,
  RollingMonthData,
} from "@/features/revenues/types";
import { logger } from "@/shared/logging/logger";

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
  actualData: RevenueDisplayRow[],
  template: RollingMonthData[],
): RevenueDisplayRow[] {
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
