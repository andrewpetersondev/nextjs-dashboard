import "server-only";

import type { AuthUserRepositoryContract } from "@/modules/auth/application/contracts/auth-user.repository.contract";
import { LoginUseCase } from "@/modules/auth/application/use-cases/user/login.use-case";
import { BcryptHasherAdapter } from "@/modules/auth/infrastructure/crypto/bcrypt-hasher.adapter";
import { AuthUserRepositoryAdapter } from "@/modules/auth/infrastructure/db/adapters/auth-user-repository.adapter";
import { AuthUserRepository } from "@/modules/auth/infrastructure/db/repositories/auth-user.repository";
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
  const hasher = new BcryptHasherAdapter();
  // Use Case (Application Core)
  return new LoginUseCase(repoContract, hasher, scopedLogger);
}
