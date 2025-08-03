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
import {
  mapRevenueRowsToEntities,
  rawDbToRevenueEntity,
} from "@/features/revenues/revenue.mapper";
import type { RevenueId } from "@/lib/definitions/brands";

/**
 * Repository interface for revenue data access operations.
 * Defines the contract for revenue persistence and retrieval.
 *
 * @remarks
 * This repository supports an event-driven architecture where revenue records
 * are created, updated, or deleted in response to invoice events.
 * The period property (YYYY-MM format) is used as a unique constraint to ensure
 * that only one revenue record exists for each month.
 */
export interface RevenueRepositoryInterface {
  create(revenue: RevenueCreateEntity): Promise<RevenueEntity>;
  read(id: RevenueId): Promise<RevenueEntity>;
  update(id: RevenueId, revenue: RevenuePartialEntity): Promise<RevenueEntity>;
  delete(id: RevenueId): Promise<void>;
  findByDateRange(
    startPeriod: string,
    endPeriod: string,
  ): Promise<RevenueEntity[]>;
  upsert(revenue: RevenueCreateEntity): Promise<RevenueEntity>;
  deleteById(id: RevenueId): Promise<void>;
  findByPeriod(period: string): Promise<RevenueEntity | null>;
  upsertByPeriod(
    period: string,
    revenue: RevenueCreateEntity,
  ): Promise<RevenueEntity>;
}

/**
 * Database implementation of the revenue repository using Drizzle ORM.
 * Provides concrete data access operations for revenue entities.
 *
 * @remarks
 * This implementation supports the event-driven architecture by:
 * - Ensuring period uniqueness through database constraints
 * - Providing methods to find, create, update, and upsert revenue records by period
 * - Handling conflicts when multiple invoice events affect the same period
 * - Supporting the calculation of revenue based on invoice events
 */
export class RevenueRepository implements RevenueRepositoryInterface {
  /**
   * Constructor using dependency injection pattern.
   *
   * @remarks
   * **Dependency Injection Benefits:**
   * - Single responsibility: focuses on data persistence operations
   * - Clear dependency contract through constructor injection
   * - Enhanced testability with mock database implementations
   *
   * @param db - Database connection instance for data operations
   */
  constructor(private readonly db: Database) {}

  async create(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenue) {
      throw new ValidationError("Revenue data is required");
    }
    const now = new Date();

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
   * Finds revenue records within the specified period range.
   * Uses period field from revenue entities for filtering.
   *
   * @param startPeriod - The start period in YYYY-MM format
   * @param endPeriod - The end period in YYYY-MM format
   * @returns Promise resolving to array of revenue entities
   */
  async findByDateRange(
    startPeriod: string,
    endPeriod: string,
  ): Promise<RevenueEntity[]> {
    if (!startPeriod || !endPeriod) {
      throw new ValidationError("Start and end periods are required");
    }

    // Query revenues within the specified date range
    const revenueRows: RevenueRow[] = await this.db
      .select()
      .from(revenues)
      .where(
        and(gte(revenues.period, startPeriod), lte(revenues.period, endPeriod)),
      )
      .orderBy(desc(revenues.period));

    if (!revenueRows) {
      throw new DatabaseError("Failed to retrieve revenue records");
    }

    return mapRevenueRowsToEntities(revenueRows);
  }

  /**
   * Finds a revenue record by its period.
   *
   * @remarks
   * This method supports the event-driven architecture by:
   * - Allowing the event handler to check if a revenue record exists for a period
   * - Returning null instead of throwing an error when no record is found
   * - Supporting the decision to create or update a revenue record
   *
   * @param period - The period in YYYY-MM format
   * @returns Promise resolving to the revenue entity or null if not found
   */
  async findByPeriod(period: string): Promise<RevenueEntity | null> {
    if (!period) {
      throw new ValidationError("Period is required");
    }

    const data: RevenueRow | undefined = await this.db
      .select()
      .from(revenues)
      .where(eq(revenues.period, period))
      .limit(1)
      .then((rows) => rows[0]);

    if (!data) {
      return null; // Return null when no record is found for the period
    }

    const result: RevenueEntity = rawDbToRevenueEntity(data);

    if (!result) {
      throw new DatabaseError("Failed to convert revenue record");
    }

    return result;
  }

  /**
   * Creates or updates a revenue record based on period uniqueness.
   * Uses period field as the conflict resolution key.
   *
   * @remarks
   * This method is a key part of the event-driven architecture:
   * - It handles conflicts when multiple invoice events affect the same period
   * - It ensures that only one revenue record exists for each period (YYYY-MM)
   * - It updates existing records when new invoice data is received
   *
   * @param revenueData - Revenue data to create or update
   * @returns Promise resolving to the created or updated revenue entity
   */
  async upsert(revenueData: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenueData) {
      throw new ValidationError("Revenue data is required");
    }

    if (!revenueData.period) {
      throw new ValidationError(
        "Revenue period (YYYY-MM) is required and must be unique",
      );
    }

    const now = new Date();

    try {
      const [data] = await this.db
        .insert(revenues)
        .values({
          ...revenueData,
          createdAt: revenueData.createdAt || now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          set: {
            calculationSource: revenueData.calculationSource,
            invoiceCount: revenueData.invoiceCount,
            revenue: revenueData.revenue,
            updatedAt: now,
          },
          target: revenues.period, // Period is a unique constraint in the database
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
    } catch (error) {
      // Handle specific database errors related to uniqueness constraint
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        throw new ValidationError(
          `Revenue record with period ${revenueData.period} already exists and could not be updated`,
        );
      }
      throw error;
    }
  }

  /**
   * Deletes a revenue record by its unique identifier.
   */
  async deleteById(id: RevenueId): Promise<void> {
    await this.db.delete(revenues).where(eq(revenues.id, id));
  }

  /**
   * Creates or updates a revenue record based on the period.
   * Uses period as the conflict resolution key to ensure uniqueness.
   *
   * @remarks
   * This method supports the event-driven architecture by:
   * - Providing a convenient way to upsert revenue records by period
   * - Ensuring the period in the revenue data matches the provided period
   * - Delegating to the main upsert method for conflict resolution
   * - Supporting the revenue calculation triggered by invoice events
   *
   * @param period - The period in YYYY-MM format
   * @param revenue - Revenue data to create or update
   * @returns Promise resolving to the created or updated revenue entity
   */
  async upsertByPeriod(
    period: string,
    revenue: RevenueCreateEntity,
  ): Promise<RevenueEntity> {
    if (!period) {
      throw new ValidationError("Period is required");
    }

    if (!revenue) {
      throw new ValidationError("Revenue data is required");
    }

    // Ensure the period in the revenue data matches the provided period
    const revenueWithPeriod: RevenueCreateEntity = {
      ...revenue,
      period,
    };

    return this.upsert(revenueWithPeriod);
  }
}
