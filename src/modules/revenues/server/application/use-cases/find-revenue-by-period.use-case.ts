import "server-only";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import type { Period } from "@/shared/branding/brands";
import { AppError } from "@/shared/errors/core/app-error.class";

export class FindRevenueByPeriodUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(period: Period): Promise<RevenueEntity | null> {
    if (!period) {
      throw new AppError("validation", { message: "Period is required" });
    }
    return await this.repository.findByPeriod(period);
  }
}
