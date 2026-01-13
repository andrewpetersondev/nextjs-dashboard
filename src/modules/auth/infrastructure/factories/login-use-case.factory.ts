import "server-only";
import type { AuthUserRepositoryContract } from "@/modules/auth/application/contracts/auth-user-repository.contract";
import { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import { AuthUserRepositoryAdapter } from "@/modules/auth/infrastructure/adapters/auth-user-repository.adapter";
import { PasswordHasherAdapter } from "@/modules/auth/infrastructure/adapters/password-hasher.adapter";
import { AuthUserRepository } from "@/modules/auth/infrastructure/repositories/auth-user.repository";
import { BcryptPasswordService } from "@/modules/auth/infrastructure/services/bcrypt-password.service";
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

  const passwordService = new BcryptPasswordService();
  const hasher: PasswordHasherContract = new PasswordHasherAdapter(
    passwordService,
  );

  // Use Case (Application Core)
  return new LoginUseCase(repoContract, hasher, scopedLogger);
}
