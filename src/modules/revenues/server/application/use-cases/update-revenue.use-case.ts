import "server-only";
import type {
  RevenueEntity,
  RevenueUpdatable,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import type { RevenueId } from "@/shared/branding/brands";
import {
  makeDatabaseError,
  makeValidationError,
} from "@/shared/errors/factories/app-error.factory";

export class UpdateRevenueUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(
    id: RevenueId,
    revenue: RevenueUpdatable,
  ): Promise<RevenueEntity> {
    if (!(id && revenue)) {
      throw makeValidationError({
        message: "Invalid revenue ID or data",
        metadata: { id, revenue },
      });
    }
    const updated = await this.repository.update(id, revenue);
    if (!updated) {
      throw makeDatabaseError({
        message: `Failed to update revenue with ID ${id}`,
        metadata: { table: "revenues" },
      });
    }
    return updated;
  }
}
