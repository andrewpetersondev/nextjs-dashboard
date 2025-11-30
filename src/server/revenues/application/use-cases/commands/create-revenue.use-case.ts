import "server-only";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/server/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import { AppError } from "@/shared/errors/app-error";

export class CreateRevenueUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenue) {
      throw new AppError("validation", {
        message: "Invalid revenue data",
      });
    }
    const created = await this.repository.create(revenue);
    if (!created) {
      throw new AppError("database", {
        context: { revenue },
        message: "Failed to create a revenue record",
      });
    }
    return created;
  }
}
