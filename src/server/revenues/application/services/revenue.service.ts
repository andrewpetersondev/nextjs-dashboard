import "server-only";

import { CreateRevenueUseCase } from "@/server/revenues/application/use-cases/create-revenue.use-case";
import { DeleteRevenueUseCase } from "@/server/revenues/application/use-cases/delete-revenue.use-case";
import { FindRevenueByPeriodUseCase } from "@/server/revenues/application/use-cases/find-revenue-by-period.use-case";
import { UpdateRevenueUseCase } from "@/server/revenues/application/use-cases/update-revenue.use-case";
import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/server/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import type { Period, RevenueId } from "@/shared/domain/domain-brands";

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
    const useCase = new CreateRevenueUseCase(this.repository);
    return await useCase.execute(revenue);
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
    const useCase = new UpdateRevenueUseCase(this.repository);
    return await useCase.execute(id, revenue);
  }

  /**
   * Deletes a revenue record by its ID.
   *
   * @param id - Unique identifier of the revenue record
   * @returns Promise resolving to void
   */
  async delete(id: RevenueId): Promise<void> {
    const useCase = new DeleteRevenueUseCase(this.repository);
    await useCase.execute(id);
  }

  /**
   * Retrieves a revenue record by its period.
   *
   * @param period - The period (first-of-month DATE)
   * @returns Promise resolving to the revenue entity or null if not found
   */
  async findByPeriod(period: Period): Promise<RevenueEntity | null> {
    const useCase = new FindRevenueByPeriodUseCase(this.repository);
    return await useCase.execute(period);
  }
}
