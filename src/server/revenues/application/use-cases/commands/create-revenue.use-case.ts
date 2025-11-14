import "server-only";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/server/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import {
  DatabaseError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";

export class CreateRevenueUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenue) {
      throw new ValidationError("Invalid revenue data");
    }
    const created = await this.repository.create(revenue);
    if (!created) {
      throw new DatabaseError("Failed to create a revenue record");
    }
    return created;
  }
}
