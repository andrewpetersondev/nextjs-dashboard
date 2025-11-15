import "server-only";
import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import type { Period } from "@/shared/branding/domain-brands";
import { ValidationError } from "@/shared/errors/base-error.subclasses";

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
