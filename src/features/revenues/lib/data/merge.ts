import type { RollingMonthData } from "@/features/revenues/core/types";
import { createDataLookupMap } from "@/features/revenues/lib/data/lookup";
import { logger } from "@/server/logging/logger";
import type { RevenueDisplayEntity } from "@/server/revenues/entity";
import { getMonthDataOrDefault } from "@/server/revenues/utils/template";

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
