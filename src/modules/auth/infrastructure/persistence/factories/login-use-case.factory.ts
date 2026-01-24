import "server-only";
import { LoginUseCase } from "@/modules/auth/application/authentication/login.use-case";
import type { AuthUserRepositoryContract } from "@/modules/auth/application/contracts/auth-user-repository.contract";
import { passwordHasherFactory } from "@/modules/auth/infrastructure/crypto/factories/password-hasher.factory";
import { AuthUserRepositoryAdapter } from "@/modules/auth/infrastructure/persistence/adapters/auth-user-repository.adapter";
import { AuthUserRepository } from "@/modules/auth/infrastructure/persistence/repositories/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Clean Architecture Factory: Wires Infrastructure into Use Case.
 */
export function loginUseCaseFactory(
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

  // Use Case (Application Core)
  return new LoginUseCase(repoContract, passwordHasherFactory(), scopedLogger);
}
