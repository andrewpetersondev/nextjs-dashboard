import "server-only";

import { DatabaseError } from "@/server/errors/infrastructure";
import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/server/revenues/domain/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import type { Period, RevenueId } from "@/shared/brands/domain-brands";
import { ValidationError } from "@/shared/errors/domain";

/**
 * Business service for revenue processing and management.
 * Handles the coordination between invoice and revenue data.
 */
export class RevenueService {
  /**
   * Constructor using a dependency injection pattern.
   *
   * @remarks
   * **Dependency Injection Benefits: **
   * - Depends on abstraction (interface) rather than concrete implementation
   * - Enhanced testability through mock repository injection
   * - Follows dependency inversion principle
   * - Business logic coordination without tight coupling
   *
   * @param repository - Repository interface for revenue data access
   */
  private readonly repository: RevenueRepositoryInterface;
  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  /**
   * Creates a new revenue record.
   *
   * @param revenue - Revenue entity to create
   * @returns Promise resolving to created revenue entity
   */
  async create(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenue) {
      throw new ValidationError("Invalid revenue data");
    }
    const created = await this.repository.create(revenue);
    if (!created) {
      throw new DatabaseError("Failed to create a revenue record");
    }
    return created;
  }

  /**
   * Updates an existing revenue record.
   *
   * @concern NOTE: Method uses RevenuePartialEntity (which omits id) but the id is used in another parameter.
   *
   * @param id - Unique identifier of the revenue record
   * @param revenue - Partial revenue entity with updated fields
   * @returns Promise resolving to the updated revenue entity
   */
  async update(
    id: RevenueId,
    revenue: RevenueUpdatable,
  ): Promise<RevenueEntity> {
    if (!id || !revenue) {
      throw new ValidationError("Invalid revenue ID or data");
    }
    const updated = await this.repository.update(id, revenue);
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
  async delete(id: RevenueId): Promise<void> {
    if (!id) {
      throw new ValidationError("Revenue ID is required");
    }
    await this.repository.delete(id);
  }

  /**
   * Retrieves a revenue record by its period.
   *
   * @param period - The period (first-of-month DATE)
   * @returns Promise resolving to the revenue entity or null if not found
   */
  async findByPeriod(period: Period): Promise<RevenueEntity | null> {
    if (!period) {
      throw new ValidationError("Period is required");
    }
    return await this.repository.findByPeriod(period);
  }
}
