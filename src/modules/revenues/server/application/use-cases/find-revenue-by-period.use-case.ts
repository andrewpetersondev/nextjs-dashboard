import "server-only";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import type { Period } from "@/shared/branding/brands";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";

export class FindRevenueByPeriodUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(period: Period): Promise<RevenueEntity | null> {
    if (!period) {
      throw makeValidationError({ message: "Period is required" });
    }
    return await this.repository.findByPeriod(period);
  }
}
