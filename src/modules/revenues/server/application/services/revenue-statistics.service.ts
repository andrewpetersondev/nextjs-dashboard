import "server-only";
import type { RevenueDisplayEntity } from "@/modules/revenues/domain/entities/entity.client";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import type { RevenueStatistics } from "@/modules/revenues/domain/types";
import { GetRevenueStatisticsUseCase } from "@/modules/revenues/server/application/use-cases/get-revenue-statistics.use-case";
import { GetRollingYearRevenuesUseCase } from "@/modules/revenues/server/application/use-cases/get-rolling-year-revenues.use-case";

/**
 * Service for calculating revenue statistics.
 *
 * This service provides methods for calculating revenue statistics for different time periods.
 * It uses the repository pattern for data access and utility functions for data transformation.
 *
 * @remarks
 * This service has been extracted from the RevenueCalculatorService to improve separation of concerns.
 */
export class RevenueStatisticsService {
  /**
   * Creates a new instance of the RevenueStatisticsService.
   *
   * @param repository - The repository for accessing revenue data
   */
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  /**
   * Calculates revenue data for the rolling 12-month period.
   * Ensures all months in the period have data entries, even if no revenue exists.
   *
   * @returns Promise resolving to an array of RevenueDisplayEntity objects
   */
  async calculateForRollingYear(): Promise<RevenueDisplayEntity[]> {
    const useCase = new GetRollingYearRevenuesUseCase(this.repository);
    return await useCase.execute();
  }

  /**
   * Calculates statistical metrics from revenue data for the rolling 12-month period.
   *
   * This is a pure calculation method that doesn't perform database operations directly
   * but calls `calculateForRollingYear()` to get the underlying data.
   *
   * @returns Promise resolving to RevenueStatistics object
   */
  async calculateStatistics(): Promise<RevenueStatistics> {
    const useCase = new GetRevenueStatisticsUseCase(this.repository);
    return await useCase.execute();
  }
}
