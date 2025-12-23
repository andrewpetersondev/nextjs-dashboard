import "server-only";

import type { UnitOfWorkPort } from "@/modules/auth/server/application/ports/unit-of-work.port";
import { CreateDemoUserUseCase } from "@/modules/auth/server/application/use-cases/user/create-demo-user.use-case";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

export function createCreateDemoUserUseCaseFactory(
  uow: UnitOfWorkPort,
  logger: LoggingClientPort,
): CreateDemoUserUseCase {
  return new CreateDemoUserUseCase(uow, createHashingService(), logger);
}
