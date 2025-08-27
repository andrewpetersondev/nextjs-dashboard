import type { RollingMonthData } from "@/features/revenues/types";
import { toPeriod } from "@/shared/brands/mappers";
import { MONTH_ORDER } from "@/shared/revenues/types";

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
