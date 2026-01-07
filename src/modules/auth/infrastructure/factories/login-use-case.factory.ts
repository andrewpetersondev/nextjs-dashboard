import "server-only";

import { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case";
import type { AuthUserRepositoryContract } from "@/modules/auth/domain/repositories/auth-user-repository.contract";
import { AuthUserRepositoryAdapter } from "@/modules/auth/infrastructure/adapters/auth-user-repository.adapter";
import { BcryptHasherAdapter } from "@/modules/auth/infrastructure/adapters/bcrypt-hasher.adapter";
import { AuthUserRepository } from "@/modules/auth/infrastructure/persistence/repositories/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Clean Architecture Factory: Wires Infrastructure into Use Case.
 */
export function createLoginUseCaseFactory(
  db: AppDatabase,
  logger: LoggingClientContract,
  requestId: string,
): LoginUseCase {
  const scopedLogger = logger.withContext("auth").withRequest(requestId);

  // Implementation (Infrastructure)
  // todo: this seems wrong. why am i using AuthUserRepository? it is not used for the signup
  const repo = new AuthUserRepository(db, scopedLogger, requestId);

  // Adapter (Bridge Infrastructure to Contract)
  const repoContract: AuthUserRepositoryContract =
    new AuthUserRepositoryAdapter(repo);
  const hasher = new BcryptHasherAdapter();
  // Use Case (Application Core)
  return new LoginUseCase(repoContract, hasher, scopedLogger);
}
