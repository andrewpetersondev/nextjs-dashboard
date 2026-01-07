import "server-only";

import { CreateDemoUserUseCase } from "@/modules/auth/application/use-cases/create-demo-user.use-case";
import type { UnitOfWorkContract } from "@/modules/auth/domain/repositories/unit-of-work.contract";
import { BcryptHasherAdapter } from "@/modules/auth/infrastructure/adapters/bcrypt-hasher.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createCreateDemoUserUseCaseFactory(
  uow: UnitOfWorkContract,
  logger: LoggingClientContract,
): CreateDemoUserUseCase {
  return new CreateDemoUserUseCase(uow, new BcryptHasherAdapter(), logger);
}
