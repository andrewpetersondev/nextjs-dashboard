import "server-only";
import type {
  RevenueEntity,
  RevenueUpdatable,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import type { RevenueId } from "@/shared/branding/brands";
import { AppError } from "@/shared/errors/core/app-error.class";

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
      throw new AppError("validation", {
        message: "Invalid revenue ID or data",
      });
    }
    const updated = await this.repository.update(id, revenue);
    if (!updated) {
      throw new AppError("database", {
        message: `Failed to update revenue with ID ${id}`,
      });
    }
    return updated;
  }
}
