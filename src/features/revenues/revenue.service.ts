import "server-only";

import type { RevenueEntity } from "@/db/models/revenue.entity";
import type { RevenueRepositoryInterface } from "@/features/revenues/revenue.repository";

/**
 * Business service for revenue processing and management.
 * Handles the coordination between invoice and revenue data.
 */
export class RevenueService {
  constructor(private readonly revenueRepository: RevenueRepositoryInterface) {}

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
