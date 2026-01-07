import "server-only";

import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenueUpdatable,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import { createRevenueDal } from "@/modules/revenues/infrastructure/repository/dal/create-revenue.dal";
import { deleteRevenueDal } from "@/modules/revenues/infrastructure/repository/dal/delete.revenue.dal";
import { findRevenueByPeriodDal } from "@/modules/revenues/infrastructure/repository/dal/find-revenue-by-period.dal";
import { findRevenuesByDateRangeDal } from "@/modules/revenues/infrastructure/repository/dal/find-revenues-by-date-range.dal";
import { readRevenueDal } from "@/modules/revenues/infrastructure/repository/dal/read-revenue.dal";
import { updateRevenueDal } from "@/modules/revenues/infrastructure/repository/dal/update-revenue.dal";
import { upsertRevenueByPeriod } from "@/modules/revenues/infrastructure/repository/dal/upsert-by-period.revenue.dal";
import { upsertRevenueDal } from "@/modules/revenues/infrastructure/repository/dal/upsert-revenue.dal";
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
    return await createRevenueDal(this.db, revenue);
  }

  /**
   * Reads a revenue record by ID.
   * @param id - The revenue ID.
   * @returns The revenue entity.
   */
  async read(id: RevenueId): Promise<RevenueEntity> {
    return await readRevenueDal(this.db, id);
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
    return await updateRevenueDal(this.db, id, revenue);
  }

  /**
   * Deletes a revenue record.
   * @param id - The revenue ID.
   */
  async delete(id: RevenueId): Promise<void> {
    await deleteRevenueDal(this.db, id);
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
    return await findRevenuesByDateRangeDal(this.db, startPeriod, endPeriod);
  }

  /**
   * Finds a revenue record by period.
   * @param period - The period.
   * @returns The revenue entity or null.
   */
  async findByPeriod(period: Period): Promise<RevenueEntity | null> {
    return await findRevenueByPeriodDal(this.db, period);
  }

  /**
   * Upserts a revenue record.
   * @param revenueData - The revenue data.
   * @returns The upserted revenue entity.
   */
  async upsert(revenueData: RevenueCreateEntity): Promise<RevenueEntity> {
    return await upsertRevenueDal(this.db, revenueData);
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
