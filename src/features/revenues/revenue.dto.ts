import "server-only";

/**
 * Data Transfer Object for simplified revenue display data.
 *
 * Contains only essential fields required for dashboard charts and basic
 * revenue visualization. Values are converted from database cents to dollars
 * for presentation purposes.
 *
 * @remarks
 * **Usage Context:**
 * - Dashboard revenue charts
 * - Summary revenue displays
 * - Client-side visualization components
 *
 * **Data Conversion:**
 * - Revenue values are converted from database cents to dollars
 * - Month numbers are sequential (1-12) for proper ordering/scrolling
 *
 * @example
 * ```typescript
 * const monthData: SimpleRevenueDto = {
 *   month: "Jan",
 *   revenue: 15000, // $15,000 (converted from 1500000 cents)
 *   monthNumber: 1
 * };
 * ```
 */
export interface SimpleRevenueDto {
  /** Three-letter month abbreviation (e.g., "Jan", "Feb", "Mar") */
  readonly month: string;
  /** Revenue amount in dollars (converted from database cents) */
  readonly revenue: number;
  /** Sequential month number (1-12) for proper chronological ordering and scrolling logic */
  readonly monthNumber: number;
}

/**
 * Complete chart data transfer object with revenue data and statistical metrics.
 *
 * Aggregates monthly revenue data with calculated statistics and metadata
 * required for comprehensive chart rendering and dashboard displays.
 *
 * @remarks
 * **Data Structure:**
 * - Monthly data is ordered chronologically (oldest to newest)
 * - All monetary values are converted to dollars for presentation
 * - Statistics provide aggregate insights across the dataset
 *
 * **Chart Integration:**
 * - Designed for direct consumption by chart components
 * - Includes both data points and contextual metadata
 * - Optimized for dashboard and analytics displays
 *
 * @example
 * ```typescript
 * const chartData: RevenueChartDto = {
 *   monthlyData: [
 *     { month: "Jan", revenue: 12000, monthNumber: 1 },
 *     { month: "Feb", revenue: 15000, monthNumber: 2 }
 *   ],
 *   statistics: {
 *     total: 27000,
 *     average: 13500,
 *     maximum: 15000,
 *     minimum: 12000,
 *     monthsWithData: 2
 *   },
 *   year: 2025
 * };
 * ```
 */
export interface RevenueChartDto {
  /** Array of monthly revenue data in chronological order */
  readonly monthlyData: SimpleRevenueDto[];
  /** Aggregated statistical metrics for the dataset */
  readonly statistics: RevenueStatisticsDto;
  /** Current year for display context and chart labeling */
  readonly year: number;
}

/**
 * Statistical metrics data transfer object with dollar-converted values.
 *
 * Contains calculated aggregate statistics from revenue data, with all
 * monetary values converted from database cents to dollars for presentation.
 *
 * @remarks
 * **Calculation Notes:**
 * - All monetary values are rounded to nearest dollar
 * - Statistics are calculated from non-zero revenue months only
 * - monthsWithData indicates actual data availability vs. template months
 *
 * **Business Logic:**
 * - Zero-revenue months are excluded from min/max/average calculations
 * - Total includes all months (including zero values)
 * - Average is calculated from months with actual revenue data
 *
 * @example
 * ```typescript
 * const stats: RevenueStatisticsDto = {
 *   maximum: 25000,    // Highest revenue month in dollars
 *   minimum: 8000,     // Lowest revenue month in dollars (non-zero)
 *   average: 16500,    // Average of non-zero months
 *   total: 198000,     // Sum of all 12 months
 *   monthsWithData: 10 // Months with actual revenue data
 * };
 * ```
 */
export interface RevenueStatisticsDto {
  /** Highest revenue amount in dollars across all months with data */
  readonly maximum: number;
  /** Lowest revenue amount in dollars (excluding zero-revenue months) */
  readonly minimum: number;
  /** Average revenue in dollars calculated from months with data */
  readonly average: number;
  /** Total revenue in dollars across all 12 months (including zeros) */
  readonly total: number;
  /** Count of months containing actual revenue data (non-zero values) */
  readonly monthsWithData: number;
}
