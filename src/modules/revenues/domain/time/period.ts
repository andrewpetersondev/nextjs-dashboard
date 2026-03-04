import { format } from "date-fns";
import type { Period } from "@/shared/primitives/period/period.brand";
import { toPeriod } from "@/shared/primitives/period/period.mappers";

/**
 * Converts a branded Period to a Date (returns the branded Date value).
 */
function periodToDate(period: Period): Date {
	return period as unknown as Date;
}

/**
 * Formats a Date as yyyy-MM (UTC-based string useful for keys).
 */
function formatYearMonthUtc(date: Date): string {
	return format(date, "yyyy-MM");
}

/**
 * Converts a Date to a branded Period (first-of-month Date).
 */
export function dateToPeriod(date: Date): Period {
	return toPeriod(date);
}

/**
 * Stable string key for a Period (yyyy-MM)
 */
export function periodKey(period: Period): string {
	const d = periodToDate(period);
	return formatYearMonthUtc(d);
}
