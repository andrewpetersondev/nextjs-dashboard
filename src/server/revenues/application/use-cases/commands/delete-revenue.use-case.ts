import "server-only";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import { ValidationError } from "@/shared/core/errors/base-error.subclasses";
import type { RevenueId } from "@/shared/domain/domain-brands";

export class DeleteRevenueUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(id: RevenueId): Promise<void> {
    if (!id) {
      throw new ValidationError("Revenue ID is required");
    }
    await this.repository.delete(id);
  }
}
