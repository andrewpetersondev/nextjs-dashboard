import "server-only";

import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { getDB } from "@/db/connection";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/db/models/revenue.entity";
import { revenues } from "@/db/schema";
import type { RevenueId } from "@/lib/definitions/brands";

/**
 * Aggregated revenue data grouped by time period.
 * Used for analytics and reporting across different time scales.
 */
export interface RevenueAggregate {
  /** Number of revenue records in this period */
  readonly count: number;
  /** Time period identifier (format depends on period type) */
  readonly period: string;
  /** Total revenue amount in cents for this period */
  readonly totalAmount: number;
}

/**
 * Repository interface for revenue data access operations.
 * Defines the contract for revenue persistence and retrieval.
 */
export interface RevenueRepository {
  /**
   * Finds revenue records within a specific date range.
   * @param startDate - Start of the date range (inclusive)
   * @param endDate - End of the date range (inclusive)
   * @returns Promise resolving to array of revenue entities
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<RevenueEntity[]>;

  /**
   * Creates or updates a revenue record.
   * @param revenue - Revenue data to persist (without timestamps)
   * @returns Promise resolving to the persisted revenue entity
   */
  upsert(revenue: RevenueCreateEntity): Promise<RevenueEntity>;

  /**
   * Deletes a revenue record by its unique identifier.
   * @param id - Unique revenue identifier
   * @returns Promise that resolves when deletion is complete
   */
  deleteById(id: RevenueId): Promise<void>;

  /**
   * Aggregates revenue data by time period for analytics.
   * @param period - Time period for grouping (month, quarter, year)
   * @returns Promise resolving to array of aggregated revenue data
   */
  aggregateByPeriod(
    period: "month" | "quarter" | "year",
  ): Promise<RevenueAggregate[]>;
}

/**
 * Database implementation of the revenue repository using Drizzle ORM.
 * Provides concrete data access operations for revenue entities.
 */
export class DatabaseRevenueRepository implements RevenueRepository {
  private readonly db = getDB();

  /**
   * Finds revenue records within the specified date range.
   * Uses startDate and endDate fields from revenue entities for filtering.
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueEntity[]> {
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    return this.db
      .select()
      .from(revenues)
      .where(
        and(
          gte(revenues.startDate, startDateStr),
          lte(revenues.endDate, endDateStr),
        ),
      )
      .orderBy(desc(revenues.year), desc(revenues.month));
  }

  /**
   * Creates or updates a revenue record based on month uniqueness.
   * Uses month field as the conflict resolution key.
   */
  async upsert(revenueData: RevenueCreateEntity): Promise<RevenueEntity> {
    const now = new Date();

    const [result] = await this.db
      .insert(revenues)
      .values({
        ...revenueData,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        set: {
          calculatedFromInvoices: revenueData.calculatedFromInvoices,
          calculationDate: revenueData.calculationDate,
          calculationSource: revenueData.calculationSource,
          invoiceCount: revenueData.invoiceCount,
          isCalculated: revenueData.isCalculated,
          revenue: revenueData.revenue,
          updatedAt: now,
        },
        target: revenues.month,
      })
      .returning();

    return result;
  }

  /**
   * Deletes a revenue record by its unique identifier.
   */
  async deleteById(id: RevenueId): Promise<void> {
    await this.db.delete(revenues).where(eq(revenues.id, id));
  }

  /**
   * Aggregates revenue data by the specified time period.
   * Groups revenue records and calculates totals for analytics.
   */
  async aggregateByPeriod(
    period: "month" | "quarter" | "year",
  ): Promise<RevenueAggregate[]> {
    const dateFormat = {
      month: "YYYY-MM",
      quarter: "YYYY-Q",
      year: "YYYY",
    }[period];

    const results = await this.db
      .select({
        count: count(revenues.id),
        period: sql<string>`TO_CHAR(${revenues.calculationDate}, '${dateFormat}')`,
        totalAmount: sum(revenues.revenue),
      })
      .from(revenues)
      .where(eq(revenues.isCalculated, true))
      .groupBy(sql`TO_CHAR(${revenues.calculationDate}, '${dateFormat}')`)
      .orderBy(sql`TO_CHAR(${revenues.calculationDate}, '${dateFormat}')`);

    return results.map((result) => ({
      count: Number(result.count) || 0,
      period: result.period,
      totalAmount: Number(result.totalAmount) || 0,
    }));
  }
}
