import "server-only";

import { SignupUseCase } from "@/modules/auth/application/use-cases/signup.use-case";
import type { UnitOfWorkContract } from "@/modules/auth/domain/repositories/unit-of-work.contract";
import { BcryptHasherAdapter } from "@/modules/auth/infrastructure/adapters/bcrypt-hasher.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createCreateUserUseCaseFactory(
  uow: UnitOfWorkContract,
  logger: LoggingClientContract,
): SignupUseCase {
  return new SignupUseCase(uow, new BcryptHasherAdapter(), logger);
}
