import "server-only";

import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { Database } from "@/db/connection";
import { type RevenueRow, revenues } from "@/db/schema";
import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/features/revenues/core/revenue.entity";
import {
  mapRevenueRowsToEntities,
  mapRevRowToRevEnt,
} from "@/features/revenues/core/revenue.mapper";
import type { RevenueRepositoryInterface } from "@/features/revenues/repository/revenue.repository.interface";
import {
  type Period,
  type RevenueId,
  toPeriod,
} from "@/lib/definitions/brands";
import { DatabaseError, ValidationError } from "@/lib/errors/errors";

/**
 * RevenueRepository
 *
 * Concrete repository implementation backed by Drizzle ORM.
 * Encapsulates all persistence operations for revenue records and enforces
 * core invariants:
 * - Period is the uniqueness key (one row per month; period is a DATE = first day of the month).
 * - Timestamps: createdAt is set on insert, updatedAt is refreshed on every write.
 * - All inputs are validated; API throws domain-centric errors (ValidationError/DatabaseError).
 *
 * Notes on consistency and conflicts
 * - All writes go through upsert(), which uses the period uniqueness constraint and
 *   applies conflict resolution (insert or update in a single round-trip).
 * - Timestamps are assigned server-side to avoid trust in caller-provided clocks.
 *
 * Error model
 * - ValidationError: missing/invalid inputs, constraint violations surfaced as user-facing validation errors.
 * - DatabaseError: unexpected persistence failures or mapping errors (conversion from raw rows).
 */
export class RevenueRepository implements RevenueRepositoryInterface {
  /**
   * Construct the repository with an injected Database connection.
   *
   * Dependency Injection benefits:
   * - Testability: pass an in-memory or mocked DB.
   * - Separation of concerns: the repository focuses purely on persistence.
   *
   * @param db - Database connection instance
   */
  constructor(private readonly db: Database) {}

  /**
   * Create a new revenue record.
   *
   * Delegates to upsert() to leverage a single conflict-handling path and avoid duplication.
   *
   * @param revenue - Full creation payload
   * @returns The created RevenueEntity
   * @throws ValidationError If payload is missing/invalid
   * @throws DatabaseError On persistence/mapping failures
   */
  async create(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenue) {
      throw new ValidationError("Revenue data is required");
    }
    // Delegate to upsert to avoid duplication; upsert handles insert and conflict update.
    return this.upsert(revenue);
  }

  /**
   * Read a revenue record by its unique identifier.
   *
   * @param id - RevenueId
   * @returns The RevenueEntity
   * @throws ValidationError If id is missing
   * @throws DatabaseError If record not found or mapping fails
   */
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

    const result: RevenueEntity = mapRevRowToRevEnt(data);

    if (!result) {
      throw new DatabaseError("Failed to convert revenue record");
    }

    return result;
  }

  /**
   * Update mutable fields of a revenue record by id.
   *
   * Timestamp semantics:
   * - updatedAt is set to now for every update.
   * - createdAt is never changed by updates.
   *
   * @param id - RevenueId of the row to update
   * @param revenue - Updatable fields (invoiceCount, revenue, calculationSource)
   * @returns The updated RevenueEntity
   * @throws ValidationError If inputs are missing
   * @throws DatabaseError If update or mapping fails
   */
  async update(
    id: RevenueId,
    revenue: RevenueUpdatable,
  ): Promise<RevenueEntity> {
    if (!id || !revenue) {
      throw new ValidationError("Revenue ID and data are required");
    }

    const now = new Date();

    const [data]: RevenueRow[] = await this.db
      .update(revenues)
      .set({
        calculationSource: revenue.calculationSource,
        invoiceCount: revenue.invoiceCount,
        totalAmount: revenue.totalAmount,
        updatedAt: now,
      })
      .where(eq(revenues.id, id))
      .returning();

    if (!data) {
      throw new DatabaseError("Failed to update revenue record");
    }

    const result: RevenueEntity = mapRevRowToRevEnt(data);

    if (!result) {
      throw new DatabaseError("Failed to convert updated revenue record");
    }

    return result;
  }

  /**
   * Delete a revenue record by id.
   *
   * @param id - RevenueId of the row to delete
   * @throws ValidationError If id is missing
   * @throws DatabaseError If deletion fails
   */
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
   * Find revenue records within an inclusive period range.
   *
   * Query characteristics:
   * - Filters by branded Period (first-of-month DATE) using gte/lte.
   * - Results are ordered by period descending (most recent first).
   *
   * @param startPeriod - Inclusive start period (first-of-month DATE)
   * @param endPeriod - Inclusive end period (first-of-month DATE)
   * @returns A list of RevenueEntity records if present; empty array otherwise
   * @throws ValidationError If either period is missing
   * @throws DatabaseError On retrieval or mapping failures
   */
  async findByDateRange(
    startPeriod: Period,
    endPeriod: Period,
  ): Promise<RevenueEntity[]> {
    if (!startPeriod || !endPeriod) {
      throw new ValidationError("Start and end periods are required");
    }

    // Query revenues within the specified date range
    const revenueRows: RevenueRow[] = await this.db
      .select()
      .from(revenues)
      .where(
        and(
          gte(revenues.period, toPeriod(startPeriod)),
          lte(revenues.period, toPeriod(endPeriod)),
        ),
      )
      .orderBy(desc(revenues.period));

    if (!revenueRows) {
      throw new DatabaseError("Failed to retrieve revenue records");
    }

    return mapRevenueRowsToEntities(revenueRows);
  }

  /**
   * Find a revenue record by its period.
   *
   * Behavior:
   * - Returns null when no record exists for the given period (non-exceptional absence).
   * - Validates period input and maps DB row to domain entity.
   *
   * @param period - Target Period (first-of-month DATE)
   * @returns The RevenueEntity or null when not found
   * @throws ValidationError If period is missing
   * @throws DatabaseError On mapping failures
   */
  async findByPeriod(period: Period): Promise<RevenueEntity | null> {
    if (!period) {
      throw new ValidationError("Period is required");
    }

    const data: RevenueRow | undefined = await this.db
      .select()
      .from(revenues)
      .where(eq(revenues.period, toPeriod(period)))
      .limit(1)
      .then((rows) => rows[0]);

    if (!data) {
      return null; // Return null when no record is found for the period
    }

    const result: RevenueEntity = mapRevRowToRevEnt(data);

    if (!result) {
      throw new DatabaseError("Failed to convert revenue record");
    }

    return result;
  }

  /**
   * Upsert (insert-or-update) a revenue record.
   *
   * Conflict handling:
   * - Uses the period uniqueness constraint as the conflict target.
   * - On conflict, updates calculationSource, invoiceCount, totalAmount, and refreshed updatedAt.
   *
   * Timestamp semantics:
   * - Insert path: createdAt = provided value or now; updatedAt = now.
   * - Update path: createdAt remains unchanged; updatedAt = now.
   *
   * @param revenueData - Full creation payload including period
   * @returns The created or updated RevenueEntity
   * @throws ValidationError If payload or period is missing, or when uniqueness violations are detected
   * @throws DatabaseError On persistence/mapping failures
   */
  async upsert(revenueData: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenueData) {
      throw new ValidationError("Revenue data is required");
    }

    if (!revenueData.period) {
      throw new ValidationError(
        "Revenue period (first-of-month DATE) is required and must be unique",
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
            totalAmount: revenueData.totalAmount,
            updatedAt: now,
          },
          target: revenues.period, // Period is a unique constraint in the database
        })
        .returning();

      if (!data) {
        throw new DatabaseError("Failed to upsert revenue record");
      }

      const result: RevenueEntity = mapRevRowToRevEnt(data);

      if (!result) {
        throw new DatabaseError("Failed to convert revenue record");
      }

      return result;
    } catch (error) {
      // Convert uniqueness-related errors into a domain-level ValidationError
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
   * Delete a revenue record by id (alias of delete()).
   *
   * Retained for backward compatibility with older callers.
   *
   * @param id - RevenueId
   * @throws ValidationError If id is missing
   * @throws DatabaseError If deletion fails
   */
  async deleteById(id: RevenueId): Promise<void> {
    // Alias for delete(id); kept for backward compatibility
    return this.delete(id);
  }

  /**
   * Upserts a revenue record for the given period.
   *
   * Contract and behavior
   * - Period enforcement: the provided `period` parameter is the source of truth.
   * - Payload shape: accepts only RevenueUpdatable (calculationSource, invoiceCount, totalAmount).
   * - Delegation: calls `upsert()` to perform the actual insert/update using the period uniqueness constraint.
   *
   * Timestamps
   * - Insert path: `createdAt = now`, `updatedAt = now`.
   * - Update path: `updatedAt = now` while preserving the original `createdAt`.
   *
   * Typical usage
   * - Services and event handlers that already computed a `period` and want to create/update the revenue row for that period without passing timestamps.
   *
   * @param period - Target Period (first-of-month DATE).
   * @param revenue - Updatable fields only (invoiceCount, totalAmount, calculationSource).
   * @returns The created or updated RevenueEntity.
   * @throws ValidationError If `period` or `revenue` is missing.
   * @throws ValidationError Propagated from `upsert()` on uniqueness/conflict-related errors.
   * @throws DatabaseError Propagated from persistence/mapping failures.
   */
  async upsertByPeriod(
    period: Period,
    revenue: RevenueUpdatable,
  ): Promise<RevenueEntity> {
    if (!period) {
      throw new ValidationError("Period is required");
    }

    if (!revenue) {
      throw new ValidationError("Revenue data is required");
    }

    const now = new Date();
    const payload: RevenueCreateEntity = {
      calculationSource: revenue.calculationSource,
      createdAt: now,
      invoiceCount: revenue.invoiceCount,
      period: toPeriod(period),
      totalAmount: revenue.totalAmount,
      updatedAt: now,
    };

    return this.upsert(payload);
  }
}
