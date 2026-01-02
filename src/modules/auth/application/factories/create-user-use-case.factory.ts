import "server-only";

import type { UnitOfWorkContract } from "@/modules/auth/application/contracts/unit-of-work.contract";
import { SignupUseCase } from "@/modules/auth/application/use-cases/user/signup.use-case";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

export function createCreateUserUseCaseFactory(
  uow: UnitOfWorkContract,
  logger: LoggingClientPort,
): SignupUseCase {
  return new SignupUseCase(uow, createHashingService(), logger);
}
