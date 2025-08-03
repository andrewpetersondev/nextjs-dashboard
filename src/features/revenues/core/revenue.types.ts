/**
 * Core type definitions for the revenue feature.
 *
 * This file contains the fundamental types and interfaces that define the
 * revenue domain model, excluding entity definitions which are in revenue.entity.ts.
 */

import type { RevenueEntity } from "@/db/models/revenue.entity";
import type { RevenueDisplayEntity } from "./revenue.entity";

/**
 * Ordered array of three-letter month abbreviations for consistent display.
 *
 * Used throughout the revenue system for month name standardization and
 * calendar month index lookups. Provides type-safe month name constraints.
 *
 * @remarks
 * **Usage Context:**
 * - Month name validation and lookup operations
 * - Template generation for 12-month periods
 * - Chart labeling and display formatting
 *
 * @example
 * ```typescript
 * const monthName = MONTH_ORDER[0]; // "Jan"
 * const isValidMonth = MONTH_ORDER.includes("Apr"); // true
 * ```
 */
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

/**
 * Type-safe union of valid month name abbreviations.
 *
 * Derived from MONTH_ORDER constant to ensure consistency between
 * the month array and type definitions.
 */
export type MonthName = (typeof MONTH_ORDER)[number];

/**
 * Standard discriminated union type for revenue operation results.
 *
 * Provides consistent success/error response structure across all revenue
 * actions and services. Enables type-safe error handling and result processing.
 *
 * @template T - The type of data returned on successful operations
 *
 * @remarks
 * **Pattern Benefits:**
 * - Type-safe error handling with discriminated unions
 * - Consistent API response structure across revenue operations
 * - Eliminates need for exception-based error handling in actions
 * - Enables exhaustive pattern matching in consuming code
 *
 * @example
 * ```typescript
 * const result: RevenueActionResult<RevenueChartDto> = await getRevenueChartAction();
 *
 * if (result.success) {
 *   // TypeScript knows result.data is RevenueChartDto
 *   console.log(result.data.statistics.total);
 * } else {
 *   // TypeScript knows result.error is string
 *   console.error(result.error);
 * }
 * ```
 */
export type RevenueActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Template metadata for a single month within a 12-month rolling period.
 *
 * Contains structural information needed to generate complete month data
 * regardless of whether actual revenue data exists for that month.
 *
 * @remarks
 * **Template System:**
 * - Ensures complete 12-month datasets even with sparse data
 * - Provides consistent month ordering and display information
 * - Separates structural metadata from actual revenue calculations
 *
 * **Field Purposes:**
 * - displayOrder: Position in chronological sequence (0-11)
 * - month: Standardized three-letter abbreviation
 * - monthNumber: Calendar month number for date calculations
 * - year: Full year for proper date range calculations
 */
export interface RollingMonthData {
  /** Zero-based position in the 12-month chronological sequence (0-11) */
  readonly displayOrder: number;
  /** Three-letter month abbreviation for display purposes */
  readonly month: MonthName;
  /** Calendar month number (1-12) for date calculations */
  readonly monthNumber: number;
  /** Four-digit year for the month */
  readonly year: number;
}

/**
 * Raw database query result containing unprocessed revenue data.
 *
 * Represents the exact structure returned from SQL revenue aggregation queries,
 * with no business logic transformations applied. All monetary values are in
 * database-native cents format.
 *
 * @remarks
 * **Data Characteristics:**
 * - Revenue values are in cents (database native format)
 * - Month names are database-generated (e.g., PostgreSQL TO_CHAR format)
 * - No business logic transformations or validations applied
 * - Direct mapping from SQL SELECT results
 *
 * **Processing Pipeline:**
 * 1. Raw query returns MonthlyRevenueQueryResult[]
 * 2. Service layer merges with templates for completeness
 * 3. Action layer converts to presentation DTOs
 *
 * @deprecated Use RevenueDisplayEntity instead. This interface is maintained for backward compatibility
 * and will be removed in a future release. The RevenueDisplayEntity interface extends RevenueEntity
 * with display-oriented fields and provides better type safety and consistency.
 */
export interface MonthlyRevenueQueryResult {
  /** Database-generated month abbreviation (typically from TO_CHAR function) */
  readonly month: string;
  /** Revenue amount in cents (database native format) */
  readonly revenue: number;
  /** Number of invoices contributing to this month's revenue */
  readonly invoiceCount: number;
  /** Four-digit year extracted from invoice dates */
  readonly year: number;
  /** Calendar month number (1-12) extracted from invoice dates */
  readonly monthNumber: number;
  /** Unique period identifier combining year and month (ex. 2025-01)  */
  readonly period: string;
}

/**
 * Calculated statistical metrics from revenue data in database-native format.
 *
 * Contains aggregate calculations performed on raw revenue data, with all
 * monetary values in cents before presentation conversion. Statistics exclude
 * zero-revenue months from min/max/average calculations.
 *
 * @remarks
 * **Calculation Rules:**
 * - Monetary values remain in cents (pre-conversion)
 * - Zero-revenue months excluded from min/max/average calculations
 * - Total includes all months (including zero values)
 * - monthsWithData counts only months with actual revenue
 *
 * **Business Logic:**
 * - Provides foundation for presentation-layer statistics
 * - Maintains precision by avoiding premature rounding
 * - Enables consistent statistical calculations across services
 *
 */
export interface RevenueStatistics {
  /** Highest revenue amount in cents across months with data */
  readonly maximum: number;
  /** Lowest revenue amount in cents (excluding zero-revenue months) */
  readonly minimum: number;
  /** Average revenue in cents calculated from months with data */
  readonly average: number;
  /** Total revenue in cents across all 12 months (including zeros) */
  readonly total: number;
  /** Count of months containing actual revenue data (non-zero values) */
  readonly monthsWithData: number;
}

/**
 * Chart axis generation result containing formatted labels and scaling information.
 *
 * Provides structured data for Y-axis generation in revenue charts, including
 * formatted label strings and maximum value for proper chart scaling.
 *
 * @remarks
 * **Chart Integration:**
 * - Designed for direct use in chart component Y-axis configuration
 * - Labels are pre-formatted with currency symbols and K notation
 * - topLabel provides scaling boundary for chart rendering
 *
 * **Label Format:**
 * - Currency values formatted as "$XXK" (e.g., "$25K", "$100K")
 * - Evenly spaced intervals for clean chart appearance
 * - Includes zero baseline for proper scale representation
 */
export interface YAxisResult {
  /** Array of formatted Y-axis labels in ascending order */
  yAxisLabels: string[];
  /** Maximum chart value in dollars for scaling purposes */
  topLabel: number;
}

/**
 * Factory method to construct RevenueDisplayEntity from RevenueEntity.
 *
 * Centralizes the logic for extracting month/year from period string,
 * ensuring consistent transformation across the application.
 *
 * @param entity - The source RevenueEntity from database
 * @returns A RevenueDisplayEntity with additional display-oriented fields
 *
 * @example
 * ```typescript
 * const displayEntity = createRevenueDisplayEntity(databaseEntity);
 * console.log(displayEntity.month); // "01"
 * console.log(displayEntity.year); // 2025
 * ```
 */
export function createRevenueDisplayEntity(
  entity: RevenueEntity,
): RevenueDisplayEntity {
  return {
    ...entity,
    month: entity.period.substring(5, 7),
    monthNumber: parseInt(entity.period.substring(5, 7), 10),
    year: parseInt(entity.period.substring(0, 4), 10),
  };
}
