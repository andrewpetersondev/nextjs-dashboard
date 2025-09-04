import "server-only";

import type { Database } from "@/server/db/connection";
import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/server/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import type { Period, RevenueId } from "@/shared/brands/domain-brands";
import { createRevenue } from "./operations/create";
import { deleteRevenue } from "./operations/delete";
import { findRevenuesByDateRange } from "./operations/find-by-date-range";
import { findRevenueByPeriod } from "./operations/find-by-period";
import { readRevenue } from "./operations/read";
import { updateRevenue } from "./operations/update";
import { upsertRevenue } from "./operations/upsert";
import { upsertRevenueByPeriod } from "./operations/upsert-by-period";

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
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

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
    return await createRevenue(this.db, revenue);
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
    return await readRevenue(this.db, id);
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
    return await updateRevenue(this.db, id, revenue);
  }

  /**
   * Delete a revenue record by id.
   *
   * @param id - RevenueId of the row to delete
   * @throws ValidationError If id is missing
   * @throws DatabaseError If deletion fails
   */
  async delete(id: RevenueId): Promise<void> {
    await deleteRevenue(this.db, id);
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
    return await findRevenuesByDateRange(this.db, startPeriod, endPeriod);
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
    return await findRevenueByPeriod(this.db, period);
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
    return await upsertRevenue(this.db, revenueData);
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
    return await this.delete(id);
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
    return await upsertRevenueByPeriod(this.db, period, revenue);
  }
}
