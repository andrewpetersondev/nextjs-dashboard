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
 * Service for calculating revenue statistics
 * Provides methods to calculate revenue for the last 12 months
 * and to calculate statistics from that data.
 * Uses pure database operations for fetching data and
 * pure calculations for statistics without side effects.
 */
export class RevenueCalculatorService {
  /**
   * Constructor for RevenueCalculatorService
   * @param db - Database connection instance
   * @remarks Uses Database type for dependency injection
   * @remarks Ensures separation of concerns by keeping database operations isolated
   */
  constructor(private db: Database) {}

  /**
   * Calculate revenue for the last 12 months (current month + previous 11 months)
   * Returns complete 12-month rolling period with zero values for months without data
   */
  async calculateForYear(): Promise<RevenueEntity[]> {
    const { startDate, endDate, monthsData } =
      this.calculateRolling12MonthPeriod();

    // Get actual data - pure database operation for rolling 12-month period. When do I use data from the Revenue table?
    const monthlyData: MonthlyRevenueQueryResult[] = await this.db
      .select({
        invoiceCount: count(invoices.id), // Necessary because every month should be rendered in the chart.
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

    // Fill in missing months with zero values for complete 12-month view
    const completeData = this.fillMissingMonthsRolling(monthlyData, monthsData);

    return completeData.map((data) => this.transformToRevenueEntity(data));
  }

  /**
   * Calculate statistics from revenue data for rolling 12-month period
   * Pure calculation - no database operations
   */
  async calculateStatistics(): Promise<RevenueStatistics> {
    const entities = await this.calculateForYear();
    const revenueValues = entities.map((e) => e.revenue).filter((r) => r > 0);

    if (revenueValues.length === 0) {
      return {
        average: 0,
        maximum: 0,
        minimum: 0,
        monthsWithData: 0,
        total: 0,
      };
    }

    return {
      average: Math.round(
        revenueValues.reduce((sum, val) => sum + val, 0) / revenueValues.length,
      ),
      maximum: Math.max(...revenueValues),
      minimum: Math.min(...revenueValues),
      monthsWithData: revenueValues.length,
      total: revenueValues.reduce((sum, val) => sum + val, 0),
    };
  }

  /**
   * Utility method to generate rolling 12-month period.
   * @remarks Returns start/end dates and month metadata for proper ordering
   * @remarks startDate is the first day of the month 12 months ago
   * @remarks endDate is the last day of the current month
   * @returns Array of MonthData objects for each month in the period
   * @example
   * Months Data: [
   *   { displayOrder: 0, month: 'Aug', monthNumber: 8, year: 2024 },
   *   { displayOrder: 1, month: 'Sep', monthNumber: 9, year: 2024 },
   *   ]
   */
  private calculateRolling12MonthPeriod(): readonly RollingMonthData[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(currentYear, currentMonth - 11 + i, 1);
      const monthIndex = monthDate.getMonth();

      return {
        displayOrder: i,
        month: MONTH_ORDER[monthIndex],
        monthNumber: monthIndex + 1,
        year: monthDate.getFullYear(),
      };
    });
  }

  /**
   * Fill missing months with zero values for complete 12-month rolling view
   * Maintains proper chronological ordering from oldest to newest month
   */
  private fillMissingMonthsRolling(
    data: MonthlyRevenueQueryResult[],
    monthsData: Array<{
      month: string;
      year: number;
      monthNumber: number;
      displayOrder: number;
    }>,
  ): MonthlyRevenueQueryResult[] {
    // Create lookup map for existing data using year-month key
    const dataMap = new Map<string, MonthlyRevenueQueryResult>();
    data.forEach((item) => {
      const key = `${item.year}-${item.monthNumber}`;
      dataMap.set(key, item);
    });

    // Generate complete 12-month dataset
    return monthsData.map((monthInfo) => {
      const key = `${monthInfo.year}-${monthInfo.monthNumber}`;
      const existingData = dataMap.get(key);

      if (existingData) {
        return {
          ...existingData,
          monthNumber: monthInfo.displayOrder + 1, // Use display order for chart positioning
        };
      }

      // Fill missing month with zero values
      return {
        invoiceCount: 0,
        month: monthInfo.month,
        monthNumber: monthInfo.displayOrder + 1, // Use display order for chart positioning
        revenue: 0,
        year: monthInfo.year,
      };
    });
  }

  /**
   * Transform query result to revenue entity
   * Private method keeps raw database values intact
   */
  private transformToRevenueEntity(
    data: MonthlyRevenueQueryResult,
  ): RevenueEntity {
    const now = new Date();

    // Calculate proper date range for this specific month
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - 12 + data.monthNumber);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0); // Last day of month
    const endDateString = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    return {
      calculatedFromInvoices: data.revenue, // Raw cents
      calculationDate: now,
      calculationSource: "invoice_aggregation_rolling_12m",
      createdAt: now,
      endDate: endDateString,
      id: crypto.randomUUID() as RevenueId,
      invoiceCount: data.invoiceCount,
      isCalculated: true,
      month: data.month,
      revenue: data.revenue, // Raw cents
      startDate: startDate,
      updatedAt: now,
      year: year,
    };
  }
}
