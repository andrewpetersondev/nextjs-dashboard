import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/modules/revenues/domain/entities/entity";
import type { Period, RevenueId } from "@/shared/branding/brands";

/**
 * RevenueRepositoryInterface
 *
 * Contract for revenue persistence operations, abstracting the underlying DB.
 * Implementations should enforce core invariants:
 * - Period is the uniqueness key (one row per month; period is a DATE = first day of the month).
 * - Timestamps: createdAt is set on insert; updatedAt is refreshed on every write.
 * - Inputs are validated and failures surface as domain-centric errors.
 */
export interface RevenueRepositoryInterface {
  /**
   * Create a new revenue record.
   */
  create(revenue: RevenueCreateEntity): Promise<RevenueEntity>;

  /**
   * Read a revenue record by its unique identifier.
   */
  read(id: RevenueId): Promise<RevenueEntity>;

  /**
   * Update mutable fields of a revenue record by id.
   */
  update(id: RevenueId, revenue: RevenueUpdatable): Promise<RevenueEntity>;

  /**
   * Delete a revenue record by id.
   */
  delete(id: RevenueId): Promise<void>;

  /**
   * Find revenue records within an inclusive period range.
   */
  findByDateRange(
    startPeriod: Period,
    endPeriod: Period,
  ): Promise<RevenueEntity[]>;

  /**
   * Upsert (insert-or-update) a revenue record.
   */
  upsert(revenue: RevenueCreateEntity): Promise<RevenueEntity>;
  /**
   * Delete a revenue record by id (alias of delete()).
   */
  deleteById(id: RevenueId): Promise<void>;

  /**
   * Find a revenue record by its period.
   */
  findByPeriod(period: Period): Promise<RevenueEntity | null>;
  /**
   * Upserts a revenue record for the given period.
   */
  upsertByPeriod(
    period: Period,
    revenue: RevenueUpdatable,
  ): Promise<RevenueEntity>;
}
