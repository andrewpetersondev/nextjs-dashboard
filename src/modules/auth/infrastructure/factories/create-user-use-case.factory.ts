import "server-only";

import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import { SignupUseCase } from "@/modules/auth/application/use-cases/signup.use-case";
import { BcryptPasswordHasherAdapter } from "@/modules/auth/infrastructure/adapters/bcrypt-password-hasher.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createCreateUserUseCaseFactory(
  uow: AuthUnitOfWorkContract,
  logger: LoggingClientContract,
): SignupUseCase {
  return new SignupUseCase(uow, new BcryptPasswordHasherAdapter(), logger);
}
