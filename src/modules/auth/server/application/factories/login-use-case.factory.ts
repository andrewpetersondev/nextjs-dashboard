import "server-only";

import type { AuthUserRepositoryContract } from "@/modules/auth/server/application/contracts/auth-user-repository.contract";
import { LoginUseCase } from "@/modules/auth/server/application/use-cases/user/login.use-case";
import { AuthUserRepositoryAdapter } from "@/modules/auth/server/infrastructure/db/adapters/auth-user-repository.adapter";
import { AuthUserRepository } from "@/modules/auth/server/infrastructure/db/repositories/auth-user.repository";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

/**
 * Clean Architecture Factory: Wires Infrastructure into Use Case.
 */
export function createLoginUseCaseFactory(
  db: AppDatabase,
  logger: LoggingClientPort,
  requestId: string,
): LoginUseCase {
  const scopedLogger = logger.withContext("auth").withRequest(requestId);

  // Implementation (Infrastructure)
  const repo = new AuthUserRepository(db, scopedLogger, requestId);

  // Adapter (Bridge Infrastructure to Contract)
  const repoContract: AuthUserRepositoryContract =
    new AuthUserRepositoryAdapter(repo);
  const hashingService = createHashingService();

  // Use Case (Application Core)
  return new LoginUseCase(repoContract, hashingService, scopedLogger);
}
