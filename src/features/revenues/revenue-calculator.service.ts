import "server-only";

import { between, count, sql } from "drizzle-orm";
import type { Database } from "@/db/connection";
import type { RevenueEntity } from "@/db/models/revenue.entity";
import { invoices } from "@/db/schema";
import type { RevenueId } from "@/lib/definitions/brands";

export class RevenueCalculatorService {
  constructor(private db: Database) {} // Dependency injection

  /**
   * Calculate revenue by aggregating invoice data directly
   * No DAL files needed - Drizzle ORM provides sufficient abstraction
   */
  async calculateForYear(year: number): Promise<RevenueEntity[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Direct Drizzle query - this IS the database layer
    const monthlyData = await this.db
      .select({
        invoiceCount: count(invoices.id),
        month: sql<string>`TO_CHAR(${invoices.date}, 'Mon')`,
        revenue: sql<number>`COALESCE(SUM(${invoices.amount}), 0)::integer`,
        year: sql<number>`${year}`,
      })
      .from(invoices)
      .where(between(invoices.date, startDate, endDate))
      .groupBy(sql`TO_CHAR(${invoices.date}, 'Mon')`)
      .orderBy(sql`EXTRACT(MONTH FROM ${invoices.date})`);

    // Transform to domain entities (minimal mapping)
    return monthlyData.map((data) => this.transformToRevenueEntity(data));
  }

  private transformToRevenueEntity(data: any): RevenueEntity {
    const now = new Date();
    return {
      calculatedFromInvoices: data.revenue,
      calculationDate: now,
      calculationSource: "invoice_aggregation",
      createdAt: now,
      endDate: `${data.year}-12-31`,
      id: crypto.randomUUID() as RevenueId, // Temp ID for calculated data
      invoiceCount: data.invoiceCount,
      isCalculated: true,
      month: data.month,
      revenue: data.revenue,
      startDate: `${data.year}-01-01`,
      updatedAt: now,
      year: data.year,
    };
  }
}
