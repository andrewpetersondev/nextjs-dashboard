import "server-only";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import type { RevenueId } from "@/shared/branding/domain-brands";
import { AppError } from "@/shared/errors/core/app-error.class";

export class DeleteRevenueUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(id: RevenueId): Promise<void> {
    if (!id) {
      throw new AppError("validation", { message: "Revenue ID is required" });
    }
    await this.repository.delete(id);
  }
}
