import "server-only";
import { LoginUseCase } from "@/modules/auth/application/auth-user/commands/login.use-case";
import type { AuthUserRepositoryContract } from "@/modules/auth/application/auth-user/contracts/repositories/auth-user-repository.contract";
import { passwordHasherFactory } from "@/modules/auth/infrastructure/composition/factories/crypto/password-hasher.factory";
import { AuthUserRepositoryAdapter } from "@/modules/auth/infrastructure/persistence/auth-user/adapters/auth-user-repository.adapter";
import { AuthUserRepository } from "@/modules/auth/infrastructure/persistence/auth-user/repositories/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for creating the LoginUseCase.
 *
 * @param db - The database connection.
 * @param logger - The logging client.
 * @param requestId - Unique identifier for the current request.
 * @returns An instance of {@link LoginUseCase}.
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
