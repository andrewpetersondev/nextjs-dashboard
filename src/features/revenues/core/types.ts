import type { Period } from "@/shared/brands/domain-brands";
import type { MonthName } from "@/shared/revenues/revenue";
import type { Cents } from "@/shared/types/money";

/**
 * Metadata for a single month in a 12-month rolling period.
 *
 * @prop displayOrder - Zero-based position in the 12-month chronological sequence (0-11)
 * @prop month - Three-letter month abbreviation for display purposes (e.g., "Jan", "Feb")
 * @prop monthNumber - Calendar month number (1-12) for date calculations
 * @prop year - Four-digit year for the month (e.g., 2023)
 * @prop period - Branded Period (first-of-month Date) for this month, used as the source of truth
 */
export interface RollingMonthData {
  readonly displayOrder: number;
  readonly month: MonthName;
  readonly monthNumber: number;
  readonly year: number;
  readonly period: Period;
}

/**
 * Calculated statistical metrics from revenue data.
 *
 * @prop maximum - Highest revenue amount in cents across months with data
 * @prop minimum - Lowest revenue amount in cents (excluding zero-revenue months)
 * @prop average - Average revenue in cents calculated from months with data
 * @prop total - Total revenue in cents across all 12 months (including zeros)
 * @prop monthsWithData - Count of months containing actual revenue data (non-zero values)
 */
export interface RevenueStatistics {
  readonly average: Cents;
  readonly maximum: Cents;
  readonly minimum: Cents;
  readonly monthsWithData: number;
  readonly total: Cents;
}

/**
 * Client-safe row used by revenues feature data utilities and charts.
 * Represents a display-oriented revenue record without server-only concerns.
 */
export interface RevenueDisplayRow {
  readonly calculationSource: import("@/features/revenues/types").RevenueSource;
  readonly invoiceCount: number;
  readonly month: MonthName;
  readonly monthNumber: number;
  readonly period: Period | string;
  readonly totalAmount: Cents;
  readonly year: number;
}
