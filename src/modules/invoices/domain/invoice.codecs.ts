import { format } from "date-fns";
import type { Period } from "@/shared/primitives/period/period.brand";

/**
 * Encodes a Date to ISO date string (YYYY-MM-DD) for transport.
 * @param date - The date to encode
 * @returns ISO date string in YYYY-MM-DD format
 */
export function encodeInvoiceDateToIso(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/**
 * Encodes a Period to first-of-month ISO date string for transport.
 * @param period - The period to encode
 * @returns ISO date string in YYYY-MM-01 format
 */
export function encodePeriodToFirstDay(period: Period): string {
	return `${format(period as unknown as Date, "yyyy-MM")}-01`;
}
