import "server-only";

import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenuePartialEntity,
} from "@/features/revenues/core/revenue.entity";
import type { Period, RevenueId } from "@/lib/definitions/brands";

/**
 * Interface defining the contract for revenue repository operations.
 *
 * Provides a consistent API for revenue data access operations,
 * abstracting the underlying database implementation details.
 *
 * @remarks
 * **Repository Pattern:**
 * - Centralizes data access logic
 * - Enables dependency injection for testing
 * - Abstracts database implementation details
 * - Provides domain-focused data access methods
 */
export interface RevenueRepositoryInterface {
  /** Creates a new revenue record */
  create(revenue: RevenueCreateEntity): Promise<RevenueEntity>;
  /** Retrieves a revenue record by ID */
  read(id: RevenueId): Promise<RevenueEntity>;
  /** Updates an existing revenue record */
  update(id: RevenueId, revenue: RevenuePartialEntity): Promise<RevenueEntity>;
  /** Deletes a revenue record by ID */
  delete(id: RevenueId): Promise<void>;
  /** Finds revenue records within a date range */
  findByDateRange(
    startPeriod: Period,
    endPeriod: Period,
  ): Promise<RevenueEntity[]>;
  /** Creates or updates a revenue record */
  upsert(revenue: RevenueCreateEntity): Promise<RevenueEntity>;
  /** Deletes a revenue record by ID */
  deleteById(id: RevenueId): Promise<void>;
  /** Finds a revenue record by period */
  findByPeriod(period: Period): Promise<RevenueEntity | null>;
  /** Creates or updates a revenue record by period */
  upsertByPeriod(
    period: Period,
    revenue: RevenuePartialEntity,
  ): Promise<RevenueEntity>;
}
