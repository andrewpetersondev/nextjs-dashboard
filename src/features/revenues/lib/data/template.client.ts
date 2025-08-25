import type { RollingMonthData } from "@/features/revenues/core/types";
import {
  createMonthTemplateFromIndex,
  getIntervalCount,
} from "@/features/revenues/lib/date/range";
import type { IntervalDuration } from "@/shared/types/revenue";

/**
 * Generates a template for the rolling period based on the start date and period type.
 *
 * @param startDate - The start date
 * @param duration - The period type ('year' or 'month')
 * @returns Array of RollingMonthData objects for the specified period
 * @throws Error if interval count is invalid or template generation fails
 *
 */
export function generateMonthsTemplate(
  startDate: Date,
  duration: IntervalDuration,
): RollingMonthData[] {
  const intervalCount = getIntervalCount(duration);

  if (intervalCount <= 0) {
    throw new Error(`Invalid interval count: ${intervalCount}`);
  }

  const template = Array.from({ length: intervalCount }, (_, index) => {
    return createMonthTemplateFromIndex(startDate, index);
  });

  if (template.length === 0) {
    throw new Error("Failed to generate a template: an empty array created");
  }

  return template;
}
