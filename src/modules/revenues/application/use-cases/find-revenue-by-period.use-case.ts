import "server-only";

import type { RevenueRepositoryContract } from "@/modules/revenues/application/contract/revenue-repository.contract";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import type { Period } from "@/shared/primitives/period/period.brand";

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
