import "server-only";

import type { UnitOfWorkContract } from "@/modules/auth/server/application/contracts/unit-of-work.contract";
import { CreateDemoUserUseCase } from "@/modules/auth/server/application/use-cases/user/create-demo-user.use-case";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

export function createCreateDemoUserUseCaseFactory(
  uow: UnitOfWorkContract,
  logger: LoggingClientPort,
): CreateDemoUserUseCase {
  return new CreateDemoUserUseCase(uow, createHashingService(), logger);
}
