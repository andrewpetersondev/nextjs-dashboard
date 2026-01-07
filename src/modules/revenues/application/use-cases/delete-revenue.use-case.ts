import "server-only";

import type { RevenueRepositoryContract } from "@/modules/revenues/application/contract/revenue-repository.contract";
import type { RevenueId } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

export class DeleteRevenueUseCase {
  private readonly repository: RevenueRepositoryContract;

  constructor(repository: RevenueRepositoryContract) {
    this.repository = repository;
  }

  async execute(id: RevenueId): Promise<void> {
    if (!id) {
      throw makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: "Revenue ID is required",
        metadata: {},
      });
    }
    await this.repository.delete(id);
  }
}
