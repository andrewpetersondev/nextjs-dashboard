import { format, parse } from "date-fns";
import { type Period, toPeriod } from "@/lib/definitions/brands";

export function formatDateToPeriod(date: Date): Period {
  return toPeriod(format(date, "yyyy-MM"));
}

export function periodToDate(period: Period): Date {
  return parse(period, "yyyy-MM", new Date());
}

/**
 * @return '00', '01', '02'
 */
export function extractMonthNumberFromPeriod(period: Period): number {
  return parseInt(period.substring(5, 7), 10);
}

export function getCurrentDateUtc(): Date {
  return new Date(Date.now());
}
