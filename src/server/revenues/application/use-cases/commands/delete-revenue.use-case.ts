import "server-only";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import type { RevenueId } from "@/shared/branding/domain-brands";
import { BaseError } from "@/shared/errors/core/base-error";

export class DeleteRevenueUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(id: RevenueId): Promise<void> {
    if (!id) {
      throw new BaseError("validation", { message: "Revenue ID is required" });
    }
    await this.repository.delete(id);
  }
}
