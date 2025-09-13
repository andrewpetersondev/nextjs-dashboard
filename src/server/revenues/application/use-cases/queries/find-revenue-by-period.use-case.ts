import "server-only";

import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import { ValidationError } from "@/shared/core/errors/domain";
import type { Period } from "@/shared/domain/domain-brands";

export class FindRevenueByPeriodUseCase {
  private readonly repository: RevenueRepositoryInterface;
  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(period: Period): Promise<RevenueEntity | null> {
    if (!period) {
      throw new ValidationError("Period is required");
    }
    return await this.repository.findByPeriod(period);
  }
}
