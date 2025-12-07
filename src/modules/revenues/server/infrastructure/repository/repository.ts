import "server-only";
import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import { createRevenue } from "@/modules/revenues/server/infrastructure/repository/dal/create.revenue.dal";
import { deleteRevenue } from "@/modules/revenues/server/infrastructure/repository/dal/delete.revenue.dal";
import { findRevenuesByDateRange } from "@/modules/revenues/server/infrastructure/repository/dal/find-by-date-range.revenue.dal";
import { findRevenueByPeriod } from "@/modules/revenues/server/infrastructure/repository/dal/find-by-period.revenue.dal";
import { readRevenue } from "@/modules/revenues/server/infrastructure/repository/dal/read.revenue.dal";
import { updateRevenue } from "@/modules/revenues/server/infrastructure/repository/dal/update.revenue.dal";
import { upsertRevenue } from "@/modules/revenues/server/infrastructure/repository/dal/upsert.revenue.dal";
import { upsertRevenueByPeriod } from "@/modules/revenues/server/infrastructure/repository/dal/upsert-by-period.revenue.dal";
import type { AppDatabase } from "@/server-core/db/db.connection";
import type { Period, RevenueId } from "@/shared/branding/brands";

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
  private readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /**
   * Create a new revenue record.
   *
   * Delegates to upsert() to leverage a single conflict-handling path and avoid duplication.
   *
   * @param revenue - Full creation payload
   * @returns The created RevenueEntity
   * @throws AppError If payload is missing/invalid
   * @throws AppError On persistence/mappers failures
   */
  async create(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    return await createRevenue(this.db, revenue);
  }

  /**
   * Read a revenue record by its unique identifier.
   *
   * @param id - RevenueId
   * @returns The RevenueEntity
   * @throws AppError If id is missing
   * @throws AppError If record not found or mappers fails
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
   * @param revenue - Updatable fields (invoiceCount, totalAmount, calculationSource)
   * @returns The updated RevenueEntity
   * @throws AppError If inputs are missing
   * @throws AppError If update or mappers fails
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
   * @throws AppError If id is missing
   * @throws AppError If deletion fails
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
   * @throws AppError If either period is missing
   * @throws AppError On retrieval or mappers failures
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
   * @throws AppError If period is missing
   * @throws AppError On mappers failures
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
   * @throws AppError If payload or period is missing, or when uniqueness violations are detected
   * @throws AppError On persistence/mappers failures
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
   * @throws AppError If id is missing
   * @throws AppError If deletion fails
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
   * @throws AppError If `period` or `revenue` is missing.
   * @throws AppError Propagated from `upsert()` on uniqueness/conflict-related errors.
   * @throws AppError Propagated from persistence/mappers failures.
   */
  async upsertByPeriod(
    period: Period,
    revenue: RevenueUpdatable,
  ): Promise<RevenueEntity> {
    return await upsertRevenueByPeriod(this.db, period, revenue);
  }
}
