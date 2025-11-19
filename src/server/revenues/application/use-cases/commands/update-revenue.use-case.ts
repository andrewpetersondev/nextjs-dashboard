import "server-only";
import type {
  RevenueEntity,
  RevenueUpdatable,
} from "@/server/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import type { RevenueId } from "@/shared/branding/domain-brands";
import { BaseError } from "@/shared/errors/base-error";

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
      throw new BaseError("validation", {
        message: "Invalid revenue ID or data",
      });
    }
    const updated = await this.repository.update(id, revenue);
    if (!updated) {
      throw new BaseError("database", {
        message: `Failed to update revenue with ID ${id}`,
      });
    }
    return updated;
  }
}
