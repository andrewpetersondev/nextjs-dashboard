import "server-only";

import { SignupCommand } from "@/modules/auth/application/commands/signup.command";
import type { UnitOfWorkContract } from "@/modules/auth/application/contracts/unit-of-work.contract";
import { BcryptHasherAdapter } from "@/modules/auth/infrastructure/cryptography/bcrypt-hasher.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createCreateUserUseCaseFactory(
  uow: UnitOfWorkContract,
  logger: LoggingClientContract,
): SignupCommand {
  return new SignupCommand(uow, new BcryptHasherAdapter(), logger);
}
