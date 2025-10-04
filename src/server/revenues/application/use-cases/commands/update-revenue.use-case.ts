import "server-only";

import { DatabaseError } from "@/server/errors/infrastructure";
import type {
  RevenueEntity,
  RevenueUpdatable,
} from "@/server/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import { ValidationError } from "@/shared/core/errors/domain-error";
import type { RevenueId } from "@/shared/domain/domain-brands";

export class UpdateRevenueUseCase {
  private readonly repository: RevenueRepositoryInterface;
  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(
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
}
