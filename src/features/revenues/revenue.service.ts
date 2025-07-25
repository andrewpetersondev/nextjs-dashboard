import "server-only";

import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import type { Database } from "@/db/connection";
import type { RevenueEntity } from "@/db/models/revenue.entity";
import { invoices } from "@/db/schema";
import { invoiceDataToRevenue } from "@/features/revenues/revenue.mapper";
import { RevenueRepository } from "@/features/revenues/revenue.repository";
import type { CustomerId } from "@/lib/definitions/brands";

export class RevenueService {
  private revenueRepository: RevenueRepository;

  constructor(private readonly db: Database) {
    this.revenueRepository = new RevenueRepository(db);
  }

  /**
   * Get or calculate revenue for a specific year
   */
  async getRevenueForYear(year: number): Promise<RevenueEntity[]> {
    try {
      const existingRevenue = await this.revenueRepository.findByYear(year);

      if (existingRevenue.length > 0) {
        return existingRevenue;
      }

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      return await this.calculateAndStoreMonthlyRevenue(startDate, endDate);
    } catch (error) {
      console.error(`Error getting revenue for year ${year}:`, error);
      throw new Error(`Failed to get revenue data for year ${year}`);
    }
  }

  /**
   * Calculate monthly revenue from invoices and store in database
   */
  async calculateAndStoreMonthlyRevenue(
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueEntity[]> {
    try {
      const calculatedRevenue = await this.calculateMonthlyRevenue(
        startDate,
        endDate,
      );
      const storedRevenue: RevenueEntity[] = [];

      for (const revenue of calculatedRevenue) {
        const stored = await this.revenueRepository.create({
          calculatedFromInvoices: revenue.calculatedFromInvoices,
          calculationDate: revenue.calculationDate,
          calculationSource: revenue.calculationSource,
          createdAt: revenue.createdAt,
          endDate: revenue.endDate,
          invoiceCount: revenue.invoiceCount,
          isCalculated: revenue.isCalculated,
          month: revenue.month,
          revenue: revenue.revenue,
          startDate: revenue.startDate,
          updatedAt: revenue.updatedAt,
          year: revenue.year,
        });

        storedRevenue.push(stored);
      }

      return storedRevenue;
    } catch (error) {
      console.error("Error calculating and storing revenue:", error);
      throw new Error("Failed to calculate and store monthly revenue");
    }
  }

  /**
   * Calculate monthly revenue from invoices within a date range
   */
  async calculateMonthlyRevenue(
    startDate: Date,
    endDate: Date,
    customerId?: CustomerId,
  ): Promise<Omit<RevenueEntity, "id">[]> {
    try {
      const whereConditions = [
        gte(invoices.date, String(startDate.toISOString().split("T")[0])),
        lte(invoices.date, String(endDate.toISOString().split("T")[0])),
      ];

      if (customerId) {
        whereConditions.push(eq(invoices.customerId, customerId));
      }

      const monthlyData = await this.db
        .select({
          invoiceCount: count(invoices.id),
          month: sql<string>`TO_CHAR(${invoices.date}, 'Mon')`,
          revenue: sql<number>`SUM(${invoices.amount})::integer`,
          year: sql<number>`EXTRACT(YEAR FROM ${invoices.date})::integer`,
        })
        .from(invoices)
        .where(and(...whereConditions))
        .groupBy(
          sql`EXTRACT(MONTH FROM ${invoices.date})`,
          sql`TO_CHAR(${invoices.date}, 'Mon')`,
          sql`EXTRACT(YEAR FROM ${invoices.date})`,
        )
        .orderBy(sql`EXTRACT(MONTH FROM ${invoices.date})`);

      return monthlyData.map((data) =>
        invoiceDataToRevenue(
          data.month,
          data.revenue || 0,
          data.invoiceCount,
          data.year,
        ),
      );
    } catch (error) {
      console.error("Revenue calculation error:", error);
      throw new Error("Failed to calculate monthly revenue from invoices.");
    }
  }

  /**
   * Recalculate revenue for a specific year
   */
  async recalculateRevenueForYear(year: number): Promise<RevenueEntity[]> {
    try {
      const existingRevenue = await this.revenueRepository.findByYear(year);

      for (const revenue of existingRevenue) {
        await this.revenueRepository.delete(revenue.id);
      }

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      return await this.calculateAndStoreMonthlyRevenue(startDate, endDate);
    } catch (error) {
      console.error(`Error recalculating revenue for year ${year}:`, error);
      throw new Error(`Failed to recalculate revenue for year ${year}`);
    }
  }
}
