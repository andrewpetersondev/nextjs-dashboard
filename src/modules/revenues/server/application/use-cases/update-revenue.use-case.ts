import "server-only";

import type {
  RevenueEntity,
  RevenueUpdatable,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import type { RevenueId } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import {
  makeAppError,
  makeUnexpectedError,
} from "@/shared/errors/factories/app-error.factory";

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
      throw makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: "Invalid revenue ID or data",
        metadata: {},
      });
    }
    const updated = await this.repository.update(id, revenue);
    if (!updated) {
      throw makeUnexpectedError("", {
        message: `Failed to update revenue with ID ${id}`,
        metadata: { table: "revenues" },
      });
    }
    return updated;
  }
}
