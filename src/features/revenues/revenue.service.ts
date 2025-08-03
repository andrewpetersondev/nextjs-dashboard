import "server-only";

import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/db/models/revenue.entity";
import { DatabaseError, ValidationError } from "@/errors/errors";
import type { RevenueRepositoryInterface } from "@/features/revenues/revenue.repository";
import type { RevenueId } from "@/lib/definitions/brands";

/**
 * Business service for revenue processing and management.
 * Handles the coordination between invoice and revenue data.
 */
export class RevenueService {
  /**
   * Constructor using dependency injection pattern.
   *
   * @remarks
   * **Dependency Injection Benefits:**
   * - Depends on abstraction (interface) rather than concrete implementation
   * - Enhanced testability through mock repository injection
   * - Follows dependency inversion principle
   * - Business logic coordination without tight coupling
   *
   * @param revenueRepository - Repository interface for revenue data access
   */
  constructor(private readonly revenueRepository: RevenueRepositoryInterface) {}

  /**
   * Creates a new revenue record.
   *
   * @param revenue - Revenue entity to create
   * @returns Promise resolving to created revenue entity
   */
  async createRevenue(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenue) {
      throw new ValidationError("Invalid revenue data");
    }
    const created = await this.revenueRepository.create(revenue);
    if (!created) {
      throw new DatabaseError("Failed to create revenue record");
    }
    return created;
  }

  /**
   * Retrieves a revenue record by its ID.
   *
   * @param id - Unique identifier of the revenue record
   * @returns Promise resolving to the revenue entity
   */
  async readRevenue(id: RevenueId): Promise<RevenueEntity> {
    if (!id) {
      throw new ValidationError("Revenue ID is required");
    }
    const revenue = await this.revenueRepository.read(id);
    if (!revenue) {
      throw new ValidationError(`Revenue with ID ${id} not found`);
    }
    return revenue;
  }

  /**
   * Updates an existing revenue record.
   *
   * @param id - Unique identifier of the revenue record
   * @param revenue - Partial revenue entity with updated fields
   * @returns Promise resolving to the updated revenue entity
   */
  async updateRevenue(
    id: RevenueId,
    revenue: Partial<RevenueEntity>,
  ): Promise<RevenueEntity> {
    if (!id || !revenue) {
      throw new ValidationError("Invalid revenue ID or data");
    }
    const updated = await this.revenueRepository.update(id, revenue);
    if (!updated) {
      throw new DatabaseError(`Failed to update revenue with ID ${id}`);
    }
    return updated;
  }

  /**
   * Deletes a revenue record by its ID.
   *
   * @param id - Unique identifier of the revenue record
   * @returns Promise resolving to void
   */
  async deleteRevenue(id: RevenueId): Promise<void> {
    if (!id) {
      throw new ValidationError("Revenue ID is required");
    }
    await this.revenueRepository.delete(id);
  }

  /**
   * Retrieves revenue records within a specific date range.
   *
   * @param startDate - Start of the date range (inclusive)
   * @param endDate - End of the date range (inclusive)
   * @returns Promise resolving to array of revenue entities
   */
  async getRevenueByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueEntity[]> {
    return this.revenueRepository.findByDateRange(startDate, endDate);
  }

  async getRevenueByPeriod(period: string): Promise<RevenueEntity> {
    if (!period) {
      throw new ValidationError("Period is required");
    }
    return this.revenueRepository.findByPeriod(period);
  }

  /**
   * Calculates revenue statistics for a given date range.
   *
   * @param startDate - Start of the analysis period
   * @param endDate - End of the analysis period
   * @returns Promise resolving to statistical summary
   */
  async getRevenueStatistics(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    average: number;
    count: number;
    total: number;
  }> {
    const revenues = await this.getRevenueByDateRange(startDate, endDate);
    const total = revenues.reduce((sum, revenue) => sum + revenue.revenue, 0);
    const count = revenues.length;
    const average = count > 0 ? Math.round(total / count) : 0;

    return { average, count, total };
  }
}
