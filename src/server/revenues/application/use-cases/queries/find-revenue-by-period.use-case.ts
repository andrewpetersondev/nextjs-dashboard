import "server-only";
import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import type { Period } from "@/shared/branding/domain-brands";
import { BaseError } from "@/shared/errors/core/base-error";

export class FindRevenueByPeriodUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(period: Period): Promise<RevenueEntity | null> {
    if (!period) {
      throw new BaseError("validation", { message: "Period is required" });
    }
    return await this.repository.findByPeriod(period);
  }
}
