import "server-only";

import type { RevenueRepositoryContract } from "@/modules/revenues/application/contract/revenue-repository.contract";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/modules/revenues/domain/entities/revenue.entity";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import {
  makeAppError,
  makeUnexpectedError,
} from "@/shared/errors/factories/app-error.factory";

export class CreateRevenueUseCase {
  private readonly repository: RevenueRepositoryContract;

  constructor(repository: RevenueRepositoryContract) {
    this.repository = repository;
  }

  async execute(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenue) {
      throw makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: "Invalid revenue data",
        metadata: {},
      });
    }
    const created = await this.repository.create(revenue);
    if (!created) {
      throw makeUnexpectedError("", {
        message: "Failed to create a revenue record",
        metadata: {},
      });
    }
    return created;
  }
}
