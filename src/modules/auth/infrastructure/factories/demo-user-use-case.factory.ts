import "server-only";

import { CreateDemoUserUseCase } from "@/modules/auth/application/use-cases/create-demo-user.use-case";
import type { UnitOfWorkContract } from "@/modules/auth/domain/repositories/unit-of-work.contract";
import { BcryptHasherAdapter } from "@/modules/auth/infrastructure/adapters/bcrypt-hasher.adapter";
import { PasswordGeneratorAdapter } from "@/modules/auth/infrastructure/adapters/password-generator.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

// TODO:  is there a reason this factory uses 2 adapter and 2 contracts instead of 4 contracts?
export function createCreateDemoUserUseCaseFactory(
  uow: UnitOfWorkContract,
  logger: LoggingClientContract,
): CreateDemoUserUseCase {
  return new CreateDemoUserUseCase(
    uow,
    new BcryptHasherAdapter(),
    new PasswordGeneratorAdapter(),
    logger,
  );
}
