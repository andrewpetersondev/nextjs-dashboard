import "server-only";

import type { AuthUserRepositoryContract } from "@/modules/auth/application/contracts/auth-user-repository.contract";
import { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case";
import { AuthUserRepositoryAdapter } from "@/modules/auth/infrastructure/adapters/auth-user-repository.adapter";
import { BcryptPasswordHasherAdapter } from "@/modules/auth/infrastructure/adapters/bcrypt-password-hasher.adapter";
import { AuthUserRepository } from "@/modules/auth/infrastructure/repositories/drizzle/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Clean Architecture Factory: Wires Infrastructure into Use Case.
 */
export function createLoginUseCase(
  db: AppDatabase,
  logger: LoggingClientContract,
  requestId: string,
): LoginUseCase {
  const scopedLogger = logger.withContext("auth").withRequest(requestId);

  // Implementation (Infrastructure)
  const repo = new AuthUserRepository(db, scopedLogger, requestId);

  // Adapter (Bridge Infrastructure to Contract)
  const repoContract: AuthUserRepositoryContract =
    new AuthUserRepositoryAdapter(repo);
  const hasher = new BcryptPasswordHasherAdapter();

  // Use Case (Application Core)
  return new LoginUseCase(repoContract, hasher, scopedLogger);
}
