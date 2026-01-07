import "server-only";

import type { RevenueRepositoryContract } from "@/modules/revenues/application/contract/revenue-repository.contract";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import type { Period } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

export class FindRevenueByPeriodUseCase {
  private readonly repository: RevenueRepositoryContract;

  constructor(repository: RevenueRepositoryContract) {
    this.repository = repository;
  }

  async execute(period: Period): Promise<RevenueEntity | null> {
    if (!period) {
      throw makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: "Period is required",
        metadata: {},
      });
    }
    return await this.repository.findByPeriod(period);
  }
}
