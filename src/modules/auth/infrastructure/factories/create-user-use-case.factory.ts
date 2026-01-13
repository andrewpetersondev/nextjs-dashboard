import "server-only";

import type { UnitOfWorkContract } from "@/modules/auth/application/contracts/unit-of-work.contract";
import { SignupUseCase } from "@/modules/auth/application/use-cases/signup.use-case";
import { BcryptPasswordHasherAdapter } from "@/modules/auth/infrastructure/adapters/bcrypt-password-hasher.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createCreateUserUseCaseFactory(
  uow: UnitOfWorkContract,
  logger: LoggingClientContract,
): SignupUseCase {
  return new SignupUseCase(uow, new BcryptPasswordHasherAdapter(), logger);
}
