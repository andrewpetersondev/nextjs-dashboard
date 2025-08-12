import "server-only";

import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/features/revenues/core/revenue.entity";
import type { Period, RevenueId } from "@/lib/definitions/brands";

/**
 * Interface defining the contract for revenue repository operations.
 *
 * Provides a consistent API for revenue data access operations,
 * abstracting the underlying database implementation details.
 *
 * @remarks
 * **Repository Pattern: **
 * - Centralizes data access logic
 * - Enables dependency injection for testing
 * - Abstracts database implementation details
 * - Provides domain-focused data access methods
 */
export interface RevenueRepositoryInterface {
  /**
   * Creates a new revenue record.
   * Note: Implementation delegates to upsert() to reduce duplication.
   */
  create(revenue: RevenueCreateEntity): Promise<RevenueEntity>;
  /** Retrieves a revenue record by ID */
  read(id: RevenueId): Promise<RevenueEntity>;
  /** Updates an existing revenue record */
  update(id: RevenueId, revenue: RevenueUpdatable): Promise<RevenueEntity>;
  /** Deletes a revenue record by ID */
  delete(id: RevenueId): Promise<void>;
  /** Finds revenue records within a date range */
  findByDateRange(
    startPeriod: Period,
    endPeriod: Period,
  ): Promise<RevenueEntity[]>;
  /** Creates or updates a revenue record */
  upsert(revenue: RevenueCreateEntity): Promise<RevenueEntity>;
  /**
   * @deprecated Use delete(id) instead. This is an alias kept for backward compatibility.
   */
  deleteById(id: RevenueId): Promise<void>;
  /** Finds a revenue record by period */
  findByPeriod(period: Period): Promise<RevenueEntity | null>;
  /**
   * Convenience wrapper around upsert() that enforces the provided period.
   * Prefer calling upsert(revenue) directly when you already have a complete RevenueCreateEntity.
   */
  upsertByPeriod(
    period: Period,
    revenue: RevenueUpdatable | RevenueCreateEntity,
  ): Promise<RevenueEntity>;
}
