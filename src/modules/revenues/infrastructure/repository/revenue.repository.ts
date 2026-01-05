import "server-only";

import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import { createRevenue } from "@/modules/revenues/infrastructure/repository/dal/create.revenue.dal";
import { deleteRevenue } from "@/modules/revenues/infrastructure/repository/dal/delete.revenue.dal";
import { findRevenuesByDateRange } from "@/modules/revenues/infrastructure/repository/dal/find-by-date-range.revenue.dal";
import { findRevenueByPeriod } from "@/modules/revenues/infrastructure/repository/dal/find-by-period.revenue.dal";
import { readRevenue } from "@/modules/revenues/infrastructure/repository/dal/read.revenue.dal";
import { updateRevenue } from "@/modules/revenues/infrastructure/repository/dal/update.revenue.dal";
import { upsertRevenue } from "@/modules/revenues/infrastructure/repository/dal/upsert.revenue.dal";
import { upsertRevenueByPeriod } from "@/modules/revenues/infrastructure/repository/dal/upsert-by-period.revenue.dal";
import type { AppDatabase } from "@/server/db/db.connection";
import type { Period, RevenueId } from "@/shared/branding/brands";

export class RevenueRepository implements RevenueRepositoryInterface {
  /**
   * Constructs the repository with a database connection.
   * @param db - The database connection.
   */
  private readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /**
   * Creates a new revenue record.
   * @param revenue - The revenue data.
   * @returns The created revenue entity.
   */
  async create(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    return await createRevenue(this.db, revenue);
  }

  /**
   * Reads a revenue record by ID.
   * @param id - The revenue ID.
   * @returns The revenue entity.
   */
  async read(id: RevenueId): Promise<RevenueEntity> {
    return await readRevenue(this.db, id);
  }

  /**
   * Updates a revenue record.
   * @param id - The revenue ID.
   * @param revenue - The updatable fields.
   * @returns The updated revenue entity.
   */
  async update(
    id: RevenueId,
    revenue: RevenueUpdatable,
  ): Promise<RevenueEntity> {
    return await updateRevenue(this.db, id, revenue);
  }

  /**
   * Deletes a revenue record.
   * @param id - The revenue ID.
   */
  async delete(id: RevenueId): Promise<void> {
    await deleteRevenue(this.db, id);
  }

  /**
   * Finds revenue records by date range.
   * @param endPeriod - The end period.
   * @param startPeriod - The start period.
   * @returns Array of revenue entities.
   */
  async findByDateRange(
    startPeriod: Period,
    endPeriod: Period,
  ): Promise<RevenueEntity[]> {
    return await findRevenuesByDateRange(this.db, startPeriod, endPeriod);
  }

  /**
   * Finds a revenue record by period.
   * @param period - The period.
   * @returns The revenue entity or null.
   */
  async findByPeriod(period: Period): Promise<RevenueEntity | null> {
    return await findRevenueByPeriod(this.db, period);
  }

  /**
   * Upserts a revenue record.
   * @param revenueData - The revenue data.
   * @returns The upserted revenue entity.
   */
  async upsert(revenueData: RevenueCreateEntity): Promise<RevenueEntity> {
    return await upsertRevenue(this.db, revenueData);
  }

  /**
   * Deletes a revenue record by ID (alias).
   * @param id - The revenue ID.
   */
  async deleteById(id: RevenueId): Promise<void> {
    return await this.delete(id);
  }

  /**
   * Upserts a revenue record by period.
   * @param period - The period.
   * @param revenue - The updatable fields.
   * @returns The upserted revenue entity.
   */
  async upsertByPeriod(
    period: Period,
    revenue: RevenueUpdatable,
  ): Promise<RevenueEntity> {
    return await upsertRevenueByPeriod(this.db, period, revenue);
  }
}
