import "server-only";

import type { UnitOfWorkContract } from "@/modules/auth/application/contracts/unit-of-work.contract";
import { CreateDemoUserUseCase } from "@/modules/auth/application/use-cases/create-demo-user.use-case";
import { BcryptPasswordHasherAdapter } from "@/modules/auth/infrastructure/adapters/bcrypt-password-hasher.adapter";
import { PolicyPasswordGeneratorAdapter } from "@/modules/auth/infrastructure/adapters/policy-password-generator.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createCreateDemoUserUseCaseFactory(
  uow: UnitOfWorkContract,
  logger: LoggingClientContract,
): CreateDemoUserUseCase {
  return new CreateDemoUserUseCase(
    uow,
    new BcryptPasswordHasherAdapter(),
    new PolicyPasswordGeneratorAdapter(),
    logger,
  );
}
