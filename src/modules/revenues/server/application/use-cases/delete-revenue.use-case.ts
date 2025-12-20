import "server-only";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import type { RevenueId } from "@/shared/branding/brands";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";

export class DeleteRevenueUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(id: RevenueId): Promise<void> {
    if (!id) {
      throw makeValidationError({
        cause: "",
        message: "Revenue ID is required",
        metadata: {},
      });
    }
    await this.repository.delete(id);
  }
}
