import "server-only";

import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/features/revenues/core/revenue.entity";
import type { Period, RevenueId } from "@/lib/types/types.brands";

/**
 * RevenueRepositoryInterface
 *
 * Contract for revenue persistence operations, abstracting the underlying DB.
 * Implementations should enforce core invariants:
 * - Period is the uniqueness key (one row per month; period is a DATE = first day of the month).
 * - Timestamps: createdAt is set on insert; updatedAt is refreshed on every write.
 * - Inputs are validated and failures surface as domain-centric errors.
 *
 * Error model guidelines
 * - ValidationError: missing/invalid inputs, uniqueness/constraint violations.
 * - DatabaseError: unexpected persistence failures or mapping errors.
 */
export interface RevenueRepositoryInterface {
  /**
   * Create a new revenue record.
   *
   * Implementations should delegate to upsert() to leverage a single
   * conflict-handling path and avoid duplication.
   *
   * @param revenue - Full creation payload
   * @returns The created RevenueEntity
   * @throws ValidationError If payload is missing/invalid
   * @throws DatabaseError On persistence/mapping failures
   */
  create(revenue: RevenueCreateEntity): Promise<RevenueEntity>;

  /**
   * Read a revenue record by its unique identifier.
   *
   * @param id - RevenueId
   * @returns The RevenueEntity
   * @throws ValidationError If id is missing
   * @throws DatabaseError If record not found or mapping fails
   */
  read(id: RevenueId): Promise<RevenueEntity>;

  /**
   * Update mutable fields of a revenue record by id.
   *
   * Timestamp semantics:
   * - updatedAt is set to now for every update.
   * - createdAt is never changed by updates.
   *
   * @param id - RevenueId of the row to update
   * @param revenue - Updatable fields (invoiceCount, totalAmount, calculationSource)
   * @returns The updated RevenueEntity
   * @throws ValidationError If inputs are missing/invalid
   * @throws DatabaseError If update or mapping fails
   */
  update(id: RevenueId, revenue: RevenueUpdatable): Promise<RevenueEntity>;

  /**
   * Delete a revenue record by id.
   *
   * @param id - RevenueId of the row to delete
   * @throws ValidationError If id is missing
   * @throws DatabaseError If deletion fails
   */
  delete(id: RevenueId): Promise<void>;

  /**
   * Find revenue records within an inclusive period range.
   *
   * Query characteristics:
   * - Filters by branded Period (first-of-month DATE) using gte/lte.
   * - Results are typically ordered by period descending (implementation detail).
   *
   * @param startPeriod - Inclusive start period (first-of-month DATE)
   * @param endPeriod - Inclusive end period (first-of-month DATE)
   * @returns A list of RevenueEntity records if present; empty array otherwise
   * @throws ValidationError If either period is missing/invalid
   * @throws DatabaseError On retrieval or mapping failures
   */
  findByDateRange(
    startPeriod: Period,
    endPeriod: Period,
  ): Promise<RevenueEntity[]>;

  /**
   * Upsert (insert-or-update) a revenue record.
   *
   * Conflict handling:
   * - Uses the period uniqueness constraint as the conflict target.
   * - On conflict, updates calculationSource, invoiceCount, totalAmount,
   *   and refreshed updatedAt.
   *
   * Timestamp semantics:
   * - Insert path: createdAt = provided value or now; updatedAt = now.
   * - Update path: createdAt remains unchanged; updatedAt = now.
   *
   * @param revenue - Full creation payload including period
   * @returns The created or updated RevenueEntity
   * @throws ValidationError If payload/period is missing or uniqueness violations occur
   * @throws DatabaseError On persistence/mapping failures
   */
  upsert(revenue: RevenueCreateEntity): Promise<RevenueEntity>;
  /**
   * Delete a revenue record by id (alias of delete()).
   *
   * Retained for backward compatibility with older callers.
   *
   * @param id - RevenueId
   * @throws ValidationError If id is missing
   * @throws DatabaseError If deletion fails
   */
  deleteById(id: RevenueId): Promise<void>;

  /**
   * Find a revenue record by its period.
   *
   * Behavior:
   * - Returns null when no record exists for the given period (non-exceptional absence).
   * - Validates period input; implementors map DB row to domain entity.
   *
   * @param period - Target Period (first-of-month DATE)
   * @returns The RevenueEntity or null when not found
   * @throws ValidationError If period is missing/invalid
   * @throws DatabaseError On mapping failures
   */
  findByPeriod(period: Period): Promise<RevenueEntity | null>;
  /**
   * Upserts a revenue record for the given period.
   *
   * Contract and behavior
   * - Period enforcement: the provided `period` parameter is the source of truth.
   * - Payload shape: accepts only RevenueUpdatable (calculationSource, invoiceCount, totalAmount).
   * - Delegation: implementors should call upsert() to perform the actual insert/update
   *   using the period uniqueness constraint.
   *
   * Timestamps
   * - Insert path: `createdAt = now`, `updatedAt = now`.
   * - Update path: `updatedAt = now` while preserving the original `createdAt`.
   *
   * Typical usage
   * - Services and event handlers that already computed a period and want to
   *   create/update the revenue row for that period without passing timestamps.
   *
   * @param period - Target Period (first-of-month DATE)
   * @param revenue - Updatable fields only (invoiceCount, totalAmount, calculationSource)
   * @returns The created or updated RevenueEntity
   * @throws ValidationError If `period` or `revenue` is missing/invalid
   * @throws ValidationError Propagated from upsert() on uniqueness/conflict-related errors
   * @throws DatabaseError Propagated from persistence/mapping failures
   */
  upsertByPeriod(
    period: Period,
    revenue: RevenueUpdatable,
  ): Promise<RevenueEntity>;
}
