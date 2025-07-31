export const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
export type MonthName = (typeof MONTH_ORDER)[number];

/**
 * Standard action result type for revenue operations
 * Provides consistent success/error response structure
 */
export type RevenueActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Represents metadata for a month in a 12-month period
 */
export interface RollingMonthData {
  readonly displayOrder: number;
  readonly month: MonthName;
  readonly monthNumber: number;
  readonly year: number;
}

/**
 * Raw database query result - exactly what SQL returns
 */
export interface MonthlyRevenueQueryResult {
  readonly month: string;
  readonly revenue: number; // Raw cents from database
  readonly invoiceCount: number;
  readonly year: number;
  readonly monthNumber: number;
}

/**
 * Statistics calculated from revenue data
 */
export interface RevenueStatistics {
  readonly maximum: number;
  readonly minimum: number;
  readonly average: number;
  readonly total: number;
  readonly monthsWithData: number;
}

export interface YAxisResult {
  yAxisLabels: string[];
  topLabel: number;
}
