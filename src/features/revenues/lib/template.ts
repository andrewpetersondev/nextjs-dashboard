import type {
  RevenueDisplayRow,
  RollingMonthData,
} from "@/features/revenues/core/types";
import { periodKey } from "@/features/revenues/lib/date/period";
import { toPeriod } from "@/shared/brands/domain-brands";
import { MONTH_ORDER } from "@/shared/revenues/types";

/**
 * Retrieves existing revenue data for a month or creates default empty data.
 * Feature-local, client-safe alternative to the server template helper.
 */
export function getMonthDataOrDefault(
  monthTemplate: RollingMonthData,
  dataLookup: Map<string, RevenueDisplayRow>,
): RevenueDisplayRow {
  const key = periodKey(monthTemplate.period);
  const existing = dataLookup.get(key);
  if (existing) return existing;

  // Default zeroed row for missing months
  return {
    calculationSource: "template",
    invoiceCount: 0,
    month: monthTemplate.month,
    monthNumber: monthTemplate.monthNumber,
    period: monthTemplate.period,
    totalAmount: 0,
    year: monthTemplate.year,
  } as const;
}

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
