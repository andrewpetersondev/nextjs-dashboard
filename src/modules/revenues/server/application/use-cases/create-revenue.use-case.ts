import "server-only";
import type {
  RevenueCreateEntity,
  RevenueEntity,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import {
  makeUnexpectedError,
  makeValidationError,
} from "@/shared/errors/factories/app-error.factory";

export class CreateRevenueUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(revenue: RevenueCreateEntity): Promise<RevenueEntity> {
    if (!revenue) {
      throw makeValidationError({
        cause: "",
        message: "Invalid revenue data",
        metadata: { revenue },
      });
    }
    const created = await this.repository.create(revenue);
    if (!created) {
      throw makeUnexpectedError("", {
        message: "Failed to create a revenue record",
        metadata: { table: "revenues" },
      });
    }
    return created;
  }
}
