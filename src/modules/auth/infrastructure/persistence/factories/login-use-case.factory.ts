import "server-only";
import type { AuthUserRepositoryContract } from "@/modules/auth/application/authn/contracts/auth-user-repository.contract";
import { LoginUseCase } from "@/modules/auth/application/authn/use-cases/login.use-case";
import { passwordHasherFactory } from "@/modules/auth/infrastructure/crypto/factories/password-hasher.factory";
import { AuthUserRepositoryAdapter } from "@/modules/auth/infrastructure/persistence/adapters/auth-user-repository.adapter";
import { AuthUserRepository } from "@/modules/auth/infrastructure/persistence/repositories/auth-user.repository";
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
