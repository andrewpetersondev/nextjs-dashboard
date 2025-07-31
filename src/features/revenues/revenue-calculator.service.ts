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
 * Provides methods to calculate revenue for the last 12 months with pure functions.
 *
 * **Dependency Injection**: This service receives its database dependency through
 * the constructor rather than creating it internally. This makes the service:
 * - More testable (we can inject a mock database)
 * - More flexible (different database implementations)
 * - Follows SOLID principles (dependency inversion)
 */
export class RevenueCalculatorService {
  constructor(private readonly db: Database) {}

  /**
   * Calculate revenue for the last 12 months (current month + previous 11 months)
   * Returns complete 12-month rolling period with zero values for months without data
   */
  async calculateForYear(): Promise<RevenueEntity[]> {
    const { startDate, endDate } = this.calculateDateRange();
    const monthsTemplate = this.generateMonthsTemplate();

    // Get actual data from invoices table
    const monthlyData = await this.fetchMonthlyRevenueData(startDate, endDate);

    // Fill missing months and transform to entities
    const completeData = this.mergeDataWithTemplate(
      monthlyData,
      monthsTemplate,
    );

    return completeData.map((data, index) =>
      this.transformToRevenueEntity(data, index, monthsTemplate[index]),
    );
  }

  /**
   * Calculate statistics from revenue data for rolling 12-month period
   * Pure calculation - no database operations
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
   * Calculate the date range for rolling 12-month period
   * Returns start date (first day 12 months ago) and end date (last day of current month)
   */
  private calculateDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // First day of month 12 months ago
    const startDate = new Date(currentYear, currentMonth - 11, 1);

    // Last day of current month
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    return {
      endDate: endDate.toISOString().split("T")[0],
      startDate: startDate.toISOString().split("T")[0],
    };
  }

  /**
   * Generate template for 12 months with proper ordering
   * Each month includes display order, month name, number, and year
   */
  private generateMonthsTemplate(): RollingMonthData[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return Array.from({ length: 12 }, (_, index) => {
      const monthDate = new Date(currentYear, currentMonth - 11 + index, 1);
      const monthIndex = monthDate.getMonth();

      return {
        displayOrder: index,
        month: MONTH_ORDER[monthIndex],
        monthNumber: monthIndex + 1,
        year: monthDate.getFullYear(),
      };
    });
  }

  /**
   * Fetch monthly revenue data from database for the specified date range
   */
  private async fetchMonthlyRevenueData(
    startDate: string,
    endDate: string,
  ): Promise<MonthlyRevenueQueryResult[]> {
    return await this.db
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
  }

  /**
   * Merge actual data with month template to ensure all 12 months are present
   * Uses a lookup strategy for O(1) data retrieval and template-driven completion
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
   * Create efficient lookup map for revenue data by year-month key
   * Time complexity: O(n) where n is the number of actual data records
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
   * Retrieve existing data for a month or create default empty data
   * Ensures consistent data structure across all 12 months
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
   * Generate consistent lookup key for year-month combination
   * Format: "YYYY-MM" for reliable map key generation
   */
  private generateLookupKey(year: number, monthNumber: number): string {
    return `${year}-${monthNumber}`;
  }

  /**
   * Create default month data structure for months without revenue
   * Ensures type safety and consistent zero-value initialization
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
   * Transform query result to revenue entity with proper date formatting
   */
  private transformToRevenueEntity(
    data: MonthlyRevenueQueryResult,
    displayOrder: number,
    template: RollingMonthData,
  ): RevenueEntity {
    const now = new Date();
    const { startDate, endDate } = this.formatMonthDateRange(
      template.year,
      template.monthNumber,
    );

    return {
      calculatedFromInvoices: data.revenue,
      calculationDate: now,
      calculationSource: "invoice_aggregation_rolling_12m",
      createdAt: now,
      endDate,
      id: crypto.randomUUID() as RevenueId,
      invoiceCount: data.invoiceCount,
      isCalculated: true,
      month: data.month,
      revenue: data.revenue,
      startDate,
      updatedAt: now,
      year: template.year, // Use template year for consistency
    };
  }

  /**
   * Format start and end dates for a specific month
   */
  private formatMonthDateRange(
    year: number,
    month: number,
  ): {
    startDate: string;
    endDate: string;
  } {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

    // Calculate last day of month
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    return { endDate, startDate };
  }

  /**
   * Create empty statistics object when no revenue data exists
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
}
