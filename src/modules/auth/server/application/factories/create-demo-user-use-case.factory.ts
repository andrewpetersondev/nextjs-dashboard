import "server-only";

import type { UnitOfWorkPort } from "@/modules/auth/server/application/ports/unit-of-work.port";
import { CreateDemoUserUseCase } from "@/modules/auth/server/application/use-cases/user/create-demo-user.use-case";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

export function createCreateDemoUserUseCaseFactory(
  uow: UnitOfWorkPort,
  logger: LoggingClientContract,
): CreateDemoUserUseCase {
  return new CreateDemoUserUseCase(uow, createHashingService(), logger);
}
