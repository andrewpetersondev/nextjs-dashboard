import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/db/connection";
import type { RevenueEntity } from "@/db/models/revenue.entity";
import { revenues } from "@/db/schema";
import { rowToEntity } from "@/features/revenues/revenue.mapper";
import type { RevenueId } from "@/lib/definitions/brands";

export class RevenueRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<RevenueEntity[]> {
    const rows = await this.db.select().from(revenues);
    return rows.map(rowToEntity);
  }

  async findById(id: RevenueId): Promise<RevenueEntity | null> {
    const result = await this.db
      .select()
      .from(revenues)
      .where(eq(revenues.id, id))
      .limit(1);

    return result[0] ? rowToEntity(result[0]) : null;
  }

  async findByYear(year: number): Promise<RevenueEntity[]> {
    const rows = await this.db
      .select()
      .from(revenues)
      .where(eq(revenues.year, year));

    return rows.map(rowToEntity);
  }

  async create(revenue: Omit<RevenueEntity, "id">): Promise<RevenueEntity> {
    const result = await this.db
      .insert(revenues)
      .values({
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
      })
      .returning();

    // Check if result exists and has at least one row
    if (!result || result.length === 0) {
      throw new Error(
        "Failed to create revenue: No data returned from insert operation",
      );
    }

    const row = result[0];
    // Ensure the row is not null or undefined
    if (!row) {
      throw new Error("Failed to create revenue: No row returned");
    }

    return rowToEntity(row);
  }

  async update(
    id: RevenueId,
    updates: Partial<RevenueEntity>,
  ): Promise<RevenueEntity | null> {
    const result = await this.db
      .update(revenues)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(revenues.id, id))
      .returning();

    return result[0] ? rowToEntity(result[0]) : null;
  }

  async delete(id: RevenueId): Promise<boolean> {
    const result = await this.db
      .delete(revenues)
      .where(eq(revenues.id, id))
      .returning();

    return result.length > 0;
  }
}
