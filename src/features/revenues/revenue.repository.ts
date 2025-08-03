import "server-only";

import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { Database } from "@/db/connection";
import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenuePartialEntity,
} from "@/db/models/revenue.entity";
import { type RevenueRow, revenues } from "@/db/schema";
import { DatabaseError, ValidationError } from "@/errors/errors";
import { rawDbToRevenueEntity } from "@/features/revenues/revenue.mapper";
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
export interface RevenueRepositoryInterface {
  create(revenue: RevenueCreateEntity): Promise<RevenueEntity>;
  read(id: RevenueId): Promise<RevenueEntity>;
  update(id: RevenueId, revenue: RevenuePartialEntity): Promise<RevenueEntity>;
  delete(id: RevenueId): Promise<void>;
  findByDateRange(startDate: Date, endDate: Date): Promise<RevenueEntity[]>;
  upsert(revenue: RevenueCreateEntity): Promise<RevenueEntity>;
  deleteById(id: RevenueId): Promise<void>;
  aggregateByPeriod(
    period: "month" | "quarter" | "year",
  ): Promise<RevenueAggregate[]>;
}

/**
 * Database implementation of the revenue repository using Drizzle ORM.
 * Provides concrete data access operations for revenue entities.
 */
export class RevenueRepository implements RevenueRepositoryInterface {
  /**
   * Notes about constructor:
   * - Pattern: Accepts concrete database dependency
   * - Purpose: Data persistence operations
   * - Good Practice: ✅ Single responsibility, clear dependency
   * @param db
   */
  constructor(private readonly db: Database) {}

  async create(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenue) {
      throw new ValidationError("Revenue data is required");
    }
    const now = new Date();

    // todo: why is this not using NewRevenueRow? confirm why this is returning an array?
    const [data]: RevenueRow[] = await this.db
      .insert(revenues)
      .values({
        ...revenue,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!data) {
      throw new DatabaseError("Failed to create revenue record");
    }

    const result: RevenueEntity = rawDbToRevenueEntity(data);

    if (!result) {
      throw new DatabaseError("Failed to convert revenue record");
    }

    return result;
  }

  async read(id: RevenueId): Promise<RevenueEntity> {
    if (!id) {
      throw new ValidationError("Revenue ID is required");
    }

    const data: RevenueRow | undefined = await this.db
      .select()
      .from(revenues)
      .where(eq(revenues.id, id))
      .limit(1)
      .then((rows) => rows[0]);

    if (!data) {
      throw new DatabaseError("Revenue record not found");
    }

    const result: RevenueEntity = rawDbToRevenueEntity(data);

    if (!result) {
      throw new DatabaseError("Failed to convert revenue record");
    }

    return result;
  }

  async update(
    id: RevenueId,
    revenue: RevenuePartialEntity,
  ): Promise<RevenueEntity> {
    if (!id || !revenue) {
      throw new ValidationError("Revenue ID and data are required");
    }

    const now = new Date();

    const [data]: RevenueRow[] = await this.db
      .update(revenues)
      .set({
        ...revenue,
        updatedAt: now,
      })
      .where(eq(revenues.id, id))
      .returning();

    if (!data) {
      throw new DatabaseError("Failed to update revenue record");
    }

    const result: RevenueEntity = rawDbToRevenueEntity(data);

    if (!result) {
      throw new DatabaseError("Failed to convert updated revenue record");
    }

    return result;
  }

  async delete(id: RevenueId): Promise<void> {
    if (!id) {
      throw new ValidationError("Revenue ID is required");
    }

    const result = await this.db
      .delete(revenues)
      .where(eq(revenues.id, id))
      .returning();

    if (!result) {
      throw new DatabaseError("Failed to delete revenue record");
    }
  }

  /**
   * Finds revenue records within the specified date range.
   * Uses startDate and endDate fields from revenue entities for filtering.
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueEntity[]> {
    if (!startDate || !endDate) {
      throw new ValidationError("Start and end dates are required");
    }

    const startDateStr = String(startDate.toISOString().split("T")[0]);
    const endDateStr = String(endDate.toISOString().split("T")[0]);

    if (!startDateStr || !endDateStr) {
      throw new Error("Date to String conversion failed");
    }

    // Query revenues within the specified date range
    const data: RevenueRow[] = await this.db
      .select()
      .from(revenues)
      .where(and(gte(startDateStr), lte(endDateStr)))
      .orderBy(desc(revenues.period));

    if (!data) {
      throw new DatabaseError("Failed to retrieve revenue records");
    }

    const entities: RevenueEntity[] = data.map((row) =>
      rawDbToRevenueEntity(row),
    );

    return entities;
  }

  /**
   * Creates or updates a revenue record based on month uniqueness.
   * Uses month field as the conflict resolution key.
   */
  async upsert(revenueData: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenueData) {
      throw new ValidationError("Revenue MONTH data is required");
    }

    const now = new Date();

    const [data] = await this.db
      .insert(revenues)
      .values({
        ...revenueData,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        set: {
          calculationSource: revenueData.calculationSource,
          invoiceCount: revenueData.invoiceCount,
          revenue: revenueData.revenue,
          updatedAt: now,
        },
        target: revenues.period, // Assuming period is a unique constraint
      })
      .returning();

    if (!data) {
      throw new DatabaseError("Failed to upsert revenue record");
    }

    const result: RevenueEntity = rawDbToRevenueEntity(data);

    if (!result) {
      throw new DatabaseError("Failed to convert revenue record");
    }

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
  async aggregateByPeriod(): Promise<RevenueAggregate[]> {
    // validate parameters
    // db call
    // validate db call
    // transform results
    // validate transformation
    // return results

    const results = [{ count: 1, period: "2024-01", totalAmount: 100 }]; // Mocked data for demonstration

    return results.map((result) => ({
      count: Number(result.count) || 0,
      period: result.period,
      totalAmount: Number(result.totalAmount) || 0,
    }));
  }
}
