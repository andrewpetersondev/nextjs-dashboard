import "server-only";

import { between, count, sql } from "drizzle-orm";
import type { Database } from "@/db/connection";
import type { RevenueEntity } from "@/db/models/revenue.entity";
import { invoices } from "@/db/schema";
import type {
  MonthlyRevenueQueryResult,
  RevenueStatistics,
  RollingMonthData,
} from "@/features/revenues/revenue.types";
import { MONTH_ORDER } from "@/features/revenues/revenue.types";
import type { RevenueId } from "@/lib/definitions/brands";

/**
 * Service for calculating revenue statistics using dependency injection pattern.
 *
 * This service provides methods to calculate revenue for the last 12 months using pure functions
 * where possible. It follows SOLID principles by accepting its database dependency through
 * constructor injection rather than creating it internally.
 *
 * @remarks
 * **Dependency Injection Benefits:**
 * - Enhanced testability through mock database injection
 * - Improved flexibility with different database implementations
 * - Adherence to SOLID principles (dependency inversion)
 *
 * @example
 * ```typescript
 * const revenueService = new RevenueCalculatorService(database);
 * const yearlyRevenue = await revenueService.calculateForYear();
 * const statistics = await revenueService.calculateStatistics();
 * ```
 */
export class RevenueCalculatorService {
  /**
   * Notes about constructor:
   * - Pattern: Accepts concrete database dependency
   * - Purpose: Data persistence operations
   * - Good Practice: ✅ Single responsibility, clear dependency
   * @param db
   */
  constructor(private readonly db: Database) {}

  /**
   * Calculates revenue data for a rolling 12-month period.
   *
   * Returns complete revenue data for the current month and previous 11 months,
   * filling in zero values for months without invoice data.
   *
   * @returns Promise resolving to array of 12 RevenueEntity objects in chronological order
   *
   * @throws {Error} When template data is missing for any month index
   * @throws {Error} When database query fails or returns no data
   *
   * @example
   * ```typescript
   * const yearlyData = await service.calculateForYear();
   * // Returns 12 months of data, oldest first
   * console.log(yearlyData.length); // 12
   * ```
   */
  async calculateForYear(): Promise<RevenueEntity[]> {
    const { startDate, endDate } = this.calculateDateRange();
    const monthsTemplate = this.generateMonthsTemplate();

    // Get actual data from invoice table
    const monthlyData = await this.fetchMonthlyRevenueData(startDate, endDate);

    // Fill missing months and transform to entities
    const completeData = this.mergeDataWithTemplate(
      monthlyData,
      monthsTemplate,
    );

    return completeData.map((data, index) => {
      const template = monthsTemplate[index];
      if (!template) {
        throw new Error(
          `Template data missing for index ${index}. Expected 12 months of template data.`,
        );
      }
      return this.transformToRevenueEntity(data, index, template);
    });
  }

  /**
   * Calculates statistical metrics from revenue data for the rolling 12-month period.
   *
   * This is a pure calculation method that doesn't perform database operations directly,
   * but calls `calculateForYear()` to get the underlying data.
   *
   * @returns Promise resolving to RevenueStatistics containing calculated metrics
   *
   * @example
   * ```typescript
   * const stats = await service.calculateStatistics();
   * console.log(`Average: ${stats.average}, Total: ${stats.total}`);
   * ```
   */
  async calculateStatistics(): Promise<RevenueStatistics> {
    const entities = await this.calculateForYear();
    const revenueValues = entities
      .map((entity) => entity.revenue)
      .filter((revenue) => revenue > 0);

    if (revenueValues.length === 0) {
      return this.createEmptyStatistics();
    }

    const total = revenueValues.reduce((sum, value) => sum + value, 0);

    return {
      average: Math.round(total / revenueValues.length),
      maximum: Math.max(...revenueValues),
      minimum: Math.min(...revenueValues),
      monthsWithData: revenueValues.length,
      total,
    };
  }

  /**
   * Calculates the date range for the rolling 12-month period.
   *
   * @returns Object containing ISO date strings for the start and end of the period
   * @returns startDate - First day of the month 12 months ago
   * @returns endDate - Last day of the current month
   *
   * @example
   * ```typescript
   * // If current date is 2025-07-31
   * const range = service.calculateDateRange();
   * // Returns: { startDate: '2024-08-01', endDate: '2025-07-31' }
   * ```
   *
   * @internal
   */
  private calculateDateRange(): { endDate: string; startDate: string } {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // First day of the month 12 months ago
    const startDate = new Date(currentYear, currentMonth - 11, 1);

    // Last day of the current month
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    return {
      endDate: String(endDate.toISOString().split("T")[0]),
      startDate: String(startDate.toISOString().split("T")[0]),
    };
  }

  /**
   * Generates a template for 12 months with proper chronological ordering.
   *
   * Creates template data for each month in the rolling period, including
   * display order, month names, numbers, and years.
   *
   * @returns Array of 12 RollingMonthData objects in chronological order
   *
   * @internal
   */
  private generateMonthsTemplate(): RollingMonthData[] {
    const rollingStartDate = this.calculateRollingStartDate();
    const monthIndices = Array.from({ length: 12 }, (_, index) => index);

    return monthIndices.map((monthIndex) =>
      this.createMonthTemplateFromIndex(rollingStartDate, monthIndex),
    );
  }

  /**
   * Creates month template data from a rolling start date and month index.
   *
   * @param rollingStartDate - The starting date for the 12-month period
   * @param monthIndex - Zero-based index within the 12-month sequence (0-11)
   * @returns RollingMonthData object for the specified month
   *
   * @internal
   */
  private createMonthTemplateFromIndex(
    rollingStartDate: Date,
    monthIndex: number,
  ): RollingMonthData {
    const monthDate = this.calculateMonthDateFromStart(
      rollingStartDate,
      monthIndex,
    );
    const calendarMonthIndex = monthDate.getMonth();

    return this.createMonthTemplateData(
      monthIndex,
      monthDate,
      calendarMonthIndex,
    );
  }

  /**
   * Calculates the starting date for the 12-month rolling period.
   *
   * @returns Date object representing first day of month 12 months ago
   *
   * @internal
   */
  private calculateRollingStartDate(): Date {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return new Date(currentYear, currentMonth - 11, 1);
  }

  /**
   * Calculates specific month date from rolling start date with offset.
   *
   * @param startDate - The rolling period start date
   * @param monthOffset - Offset from start date (0-11)
   * @returns Date object for the calculated month
   *
   * @internal
   */
  private calculateMonthDateFromStart(
    startDate: Date,
    monthOffset: number,
  ): Date {
    return new Date(
      startDate.getFullYear(),
      startDate.getMonth() + monthOffset,
      1,
    );
  }

  /**
   * Creates month template data with validated month name lookup.
   *
   * @param displayOrder - Display order in the 12-month sequence (0-11)
   * @param monthDate - Date object for the specific month
   * @param calendarMonthIndex - Zero-based month index (0-11)
   * @returns RollingMonthData object with all required fields
   *
   * @throws {Error} When calendarMonthIndex is outside valid range (0-11)
   *
   * @internal
   */
  private createMonthTemplateData(
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

    return {
      displayOrder,
      month: monthName,
      monthNumber: calendarMonthIndex + 1,
      year: monthDate.getFullYear(),
    };
  }

  /**
   * Fetches monthly revenue data from database for the specified date range.
   *
   * Executes a SQL query that groups invoices by month and year, calculating
   * total revenue and invoice count for each month within the date range.
   *
   * @param startDate - ISO date string for query start date
   * @param endDate - ISO date string for query end date
   * @returns Promise resolving to array of monthly revenue query results
   *
   * @throws {Error} When date range parameters are invalid
   * @throws {Error} When database query returns no data
   *
   * @internal
   */
  private async fetchMonthlyRevenueData(
    startDate: string,
    endDate: string,
  ): Promise<MonthlyRevenueQueryResult[]> {
    if (!startDate || !endDate) {
      throw new Error("Invalid date range for revenue query");
    }
    if (!this.isValidISODate(startDate) || !this.isValidISODate(endDate)) {
      throw new Error(
        "Invalid date format: dates must be in ISO format (YYYY-MM-DD)",
      );
    }

    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error("Invalid date range: startDate must be before endDate");
    }
    const data = await this.db
      .select({
        invoiceCount: count(invoices.id),
        month: sql<string>`TO_CHAR(${invoices.date}, 'Mon')`,
        monthNumber: sql<number>`EXTRACT(MONTH FROM ${invoices.date})::integer`,
        revenue: sql<number>`COALESCE(SUM(${invoices.amount}), 0)::integer`,
        year: sql<number>`EXTRACT(YEAR FROM ${invoices.date})::integer`,
      })
      .from(invoices)
      .where(between(invoices.date, startDate, endDate))
      .groupBy(
        sql`TO_CHAR(${invoices.date}, 'Mon')`,
        sql`EXTRACT(YEAR FROM ${invoices.date})`,
        sql`EXTRACT(MONTH FROM ${invoices.date})`,
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${invoices.date})`,
        sql`EXTRACT(MONTH FROM ${invoices.date})`,
      );
    if (!data || data.length === 0) {
      throw new Error("No revenue data found for the specified date range");
    }
    return data;
  }

  /**
   * Merges actual revenue data with month template to ensure complete 12-month dataset.
   *
   * Uses an efficient lookup strategy with O(1) data retrieval via Map-based lookup
   * and template-driven completion to fill missing months with zero values.
   *
   * @param actualData - Array of actual revenue data from database
   * @param template - Array of 12 month templates
   * @returns Array of 12 complete monthly revenue results
   *
   * @internal
   */
  private mergeDataWithTemplate(
    actualData: MonthlyRevenueQueryResult[],
    template: RollingMonthData[],
  ): MonthlyRevenueQueryResult[] {
    const dataLookup = this.createDataLookupMap(actualData);

    return template.map((monthTemplate) =>
      this.getMonthDataOrDefault(monthTemplate, dataLookup),
    );
  }

  /**
   * Creates an efficient lookup map for revenue data indexed by year-month key.
   *
   * @param actualData - Array of revenue data from database query
   * @returns Map with year-month keys and corresponding revenue data
   *
   * @remarks
   * Time complexity: O(n) where n is the number of actual data records
   *
   * @internal
   */
  private createDataLookupMap(
    actualData: MonthlyRevenueQueryResult[],
  ): Map<string, MonthlyRevenueQueryResult> {
    const dataMap = new Map<string, MonthlyRevenueQueryResult>();

    actualData.forEach((dataItem) => {
      const { year, monthNumber } = dataItem;
      const lookupKey = this.generateLookupKey(year, monthNumber);
      dataMap.set(lookupKey, dataItem);
    });

    return dataMap;
  }

  /**
   * Retrieves existing revenue data for a month or creates default empty data.
   *
   * Ensures consistent data structure across all 12 months by providing
   * zero-value defaults for months without revenue data.
   *
   * @param monthTemplate - Template data for the target month
   * @param dataLookup - Map containing actual revenue data
   * @returns Complete monthly revenue data (actual or default)
   *
   * @internal
   */
  private getMonthDataOrDefault(
    monthTemplate: RollingMonthData,
    dataLookup: Map<string, MonthlyRevenueQueryResult>,
  ): MonthlyRevenueQueryResult {
    const { year, monthNumber, month } = monthTemplate;
    const lookupKey = this.generateLookupKey(year, monthNumber);
    const existingData = dataLookup.get(lookupKey);

    if (existingData) {
      return existingData;
    }

    return this.createDefaultMonthData(month, monthNumber, year);
  }

  /**
   * Generates a consistent lookup key for year-month combination.
   *
   * @param year - Four-digit year
   * @param monthNumber - Month number (1-12)
   * @returns Formatted key string in "YYYY-MM" format
   *
   * @internal
   */
  private generateLookupKey(year: number, monthNumber: number): string {
    return `${year}-${monthNumber}`;
  }

  /**
   * Creates a default month data structure for months without revenue.
   *
   * Ensures type safety and consistent zero-value initialization for months
   * that don't have corresponding invoice data.
   *
   * @param month - Month name (e.g., "Jan", "Feb")
   * @param monthNumber - Month number (1-12)
   * @param year - Four-digit year
   * @returns MonthlyRevenueQueryResult with zero values
   *
   * @internal
   */
  private createDefaultMonthData(
    month: string,
    monthNumber: number,
    year: number,
  ): MonthlyRevenueQueryResult {
    return {
      invoiceCount: 0,
      month,
      monthNumber,
      revenue: 0,
      year,
    } as const;
  }

  /**
   * Transforms a monthly query result into a complete revenue entity.
   *
   * Combines query data with template information and adds metadata
   * such as date ranges, timestamps, and unique identifiers.
   *
   * @param data - Monthly revenue data from query or default
   * @param _displayOrder - Order index within the 12-month sequence
   * @param template - Template data containing month metadata
   * @returns Complete RevenueEntity with all required fields
   *
   * @internal
   */
  private transformToRevenueEntity(
    data: MonthlyRevenueQueryResult,
    _displayOrder: number,
    template: RollingMonthData,
  ): RevenueEntity {
    const dateRange = this.formatMonthDateRange(
      template.year,
      template.monthNumber,
    );
    const baseTimestamp = new Date();
    const entityId = crypto.randomUUID() as RevenueId;

    return this.createRevenueEntityData(
      data,
      template,
      dateRange,
      baseTimestamp,
      entityId,
    );
  }

  /**
   * Creates a complete revenue entity data structure with all required fields.
   *
   * @param data - Monthly revenue query result
   * @param _template - Month template data
   * @param _dateRange - Start and end dates for the month
   * @param timestamp - Creation/update timestamp
   * @param entityId - Unique identifier for the entity
   * @returns Complete RevenueEntity object
   *
   * @internal
   */
  private createRevenueEntityData(
    data: MonthlyRevenueQueryResult,
    _template: RollingMonthData,
    _dateRange: { startDate: string; endDate: string },
    timestamp: Date,
    entityId: RevenueId,
  ): RevenueEntity {
    return {
      calculationSource: "invoice_aggregation_rolling_12m",
      createdAt: timestamp,
      id: entityId,
      invoiceCount: data.invoiceCount,
      period: data.period,
      revenue: data.revenue,
      updatedAt: timestamp,
    };
  }

  /**
   * Formats start and end dates for a specific month.
   *
   * @param year - Four-digit year
   * @param month - Month number (1-12)
   * @returns Object containing formatted start and end date strings
   *
   * @internal
   */
  private formatMonthDateRange(
    year: number,
    month: number,
  ): { startDate: string; endDate: string } {
    const startDate = this.formatMonthStartDate(year, month);
    const endDate = this.formatMonthEndDate(year, month);

    return { endDate, startDate };
  }

  /**
   * Formats the first day of a month as an ISO date string.
   *
   * @param year - Four-digit year
   * @param month - Month number (1-12)
   * @returns ISO date string for the first day of the month
   *
   * @internal
   */
  private formatMonthStartDate(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, "0")}-01`;
  }

  /**
   * Formats the last day of a month as an ISO date string.
   *
   * @param year - Four-digit year
   * @param month - Month number (1-12)
   * @returns ISO date string for the last day of the month
   *
   * @internal
   */
  private formatMonthEndDate(year: number, month: number): string {
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  /**
   * Creates an empty statistics object when no revenue data exists.
   *
   * @returns RevenueStatistics object with all zero values
   *
   * @internal
   */
  private createEmptyStatistics(): RevenueStatistics {
    return {
      average: 0,
      maximum: 0,
      minimum: 0,
      monthsWithData: 0,
      total: 0,
    };
  }
  /**
   * Validates if a string is a properly formatted ISO date (YYYY-MM-DD).
   *
   * @param dateString - String to validate as ISO date
   * @returns True if valid ISO date, false otherwise
   *
   * @internal
   */
  private isValidISODate(dateString: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return (
      isoDateRegex.test(dateString) && !Number.isNaN(Date.parse(dateString))
    );
  }
}
