import "server-only";

import type { UnitOfWorkPort } from "@/modules/auth/server/application/ports/unit-of-work.port";
import { CreateUserUseCase } from "@/modules/auth/server/application/use-cases/user/create-user.use-case";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

export function createCreateUserUseCaseFactory(
  uow: UnitOfWorkPort,
  logger: LoggingClientPort,
): CreateUserUseCase {
  return new CreateUserUseCase(uow, createHashingService(), logger);
}
