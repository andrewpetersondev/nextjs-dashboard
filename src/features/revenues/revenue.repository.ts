import "server-only";

import { eq } from "drizzle-orm";
import type {
  RevenueCreateEntity,
  RevenueEntity,
  RevenuePartialEntity,
} from "@/db/models/revenue.entity";
import { revenues } from "@/db/schema";
import { ValidationError } from "@/errors/errors";
import {
  createRevenueDal,
  readRevenueDal,
} from "@/features/revenues/revenue.dal";
import type { RevenueDto } from "@/features/revenues/revenue.dto";
import {
  entityToRevenueDto,
  rawDbToRevenueEntity,
} from "@/features/revenues/revenue.mapper";
import { REVENUE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { RevenueId } from "@/lib/definitions/brands";
import { BaseRepository } from "@/lib/repository/base-repository";

export class RevenueRepository extends BaseRepository<
  RevenueDto, // TDto - what gets returned to the service layer
  RevenueId, // TId - branded ID type
  RevenueCreateEntity, // TCreateInput - input type for creation
  RevenuePartialEntity // TUpdateRevenueEntity - input type for updates
> {
  /**
   * Create a new revenue entry.
   * @param input - The input data for creating a new revenue entry.
   * @returns A promise that resolves to the created RevenueDto.
   * @throws ValidationError if the input is invalid.
   * @throws DatabaseError if the creation fails.
   */
  async create(input: RevenueCreateEntity): Promise<RevenueDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!input || typeof input !== "object") {
      throw new ValidationError(REVENUE_ERROR_MESSAGES.VALIDATION_FAILED);
    }

    // Call DAL with branded entity. Function returns RevenueEntity.
    const createdEntity: RevenueEntity = await createRevenueDal(this.db, input);

    // Transform Entity (branded) → DTO (plain)
    return entityToRevenueDto(createdEntity);
  }

  /**
   * Reads a revenue entry by ID.
   * @param id - The ID of the revenue entry to read, branded as `RevenueId`.
   * @returns A promise that resolves to the RevenueDto.
   * @throws ValidationError if the ID is invalid.
   * @throws DatabaseError if the read operation fails.
   */
  async read(id: RevenueId): Promise<RevenueDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!id) {
      throw new ValidationError(REVENUE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Call DAL with branded ID
    const entity = await readRevenueDal(this.db, id);

    // Transform Entity (branded) → DTO (plain)
    return entityToRevenueDto(entity);
  }

  // async update(): Promise<RevenueDto>{
  // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
  //     if (!input || typeof input !== "object") {
  //       throw new ValidationError(REVENUE_ERROR_MESSAGES.VALIDATION_FAILED);
  //     }
  // }

  // async delete(): Promise<RevenueDto>{
  // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
  //     if (!input || typeof input !== "object") {
  //       throw new ValidationError(REVENUE_ERROR_MESSAGES.VALIDATION_FAILED);
  //     }
  // }

  async findByYear(year: number): Promise<RevenueEntity[]> {
    const rows = await this.db
      .select()
      .from(revenues)
      .where(eq(revenues.year, year));

    return rows.map(rawDbToRevenueEntity);
  }
}
