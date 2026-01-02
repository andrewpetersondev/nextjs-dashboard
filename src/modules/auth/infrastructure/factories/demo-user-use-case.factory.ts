import "server-only";

import { CreateDemoUserCommand } from "@/modules/auth/application/use-cases/commands/create-demo-user.command";
import type { UnitOfWorkContract } from "@/modules/auth/domain/repositories/unit-of-work.contract";
import { BcryptHasherAdapter } from "@/modules/auth/infrastructure/cryptography/bcrypt-hasher.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createCreateDemoUserUseCaseFactory(
  uow: UnitOfWorkContract,
  logger: LoggingClientContract,
): CreateDemoUserCommand {
  return new CreateDemoUserCommand(uow, new BcryptHasherAdapter(), logger);
}
