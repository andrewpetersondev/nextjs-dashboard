import "server-only";

import { between, count, sql } from "drizzle-orm";
import type { Database } from "@/db/connection";
import type { RevenueEntity } from "@/db/models/revenue.entity";
import { invoices } from "@/db/schema";
import type { RevenueId } from "@/lib/definitions/brands";

/**
 * Type representing the raw result from the revenue calculation query
 * Matches the structure returned by the Drizzle select operation
 */
interface MonthlyRevenueQueryResult {
  readonly month: string;
  readonly revenue: number;
  readonly invoiceCount: number;
  readonly year: number;
  readonly monthNumber: number;
}

export class RevenueCalculatorService {
  constructor(private db: Database) {}

  /**
   * Calculate revenue by aggregating invoice data directly
   */
  async calculateForYear(year: number): Promise<RevenueEntity[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Fixed query with proper GROUP BY and type casting
    const monthlyData: MonthlyRevenueQueryResult[] = await this.db
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
      .orderBy(sql`EXTRACT(MONTH FROM ${invoices.date})`);

    // Debug logging to verify data integrity
    console.log("Revenue calculation debug:", {
      resultCount: monthlyData.length,
      sampleData: monthlyData.slice(0, 2),
      totalRevenue: monthlyData.reduce((sum, item) => sum + item.revenue, 0),
      year,
    });

    return monthlyData.map((data) => this.transformToRevenueEntity(data));
  }

  /**
   * Transform query result to revenue entity
   * Private method ensures this logic stays coupled with the query above
   */
  private transformToRevenueEntity(
    data: MonthlyRevenueQueryResult,
  ): RevenueEntity {
    const now = new Date();
    return {
      calculatedFromInvoices: data.revenue,
      calculationDate: now,
      calculationSource: "invoice_aggregation",
      createdAt: now,
      endDate: `${data.year}-12-31`,
      id: crypto.randomUUID() as RevenueId,
      invoiceCount: data.invoiceCount,
      isCalculated: true,
      month: data.month,
      revenue: data.revenue, // This should match the SQL result exactly
      startDate: `${data.year}-01-01`,
      updatedAt: now,
      year: data.year,
    };
  }
}
