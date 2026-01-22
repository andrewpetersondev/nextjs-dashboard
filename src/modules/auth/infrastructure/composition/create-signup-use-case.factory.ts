import "server-only";
import { SignupUseCase } from "@/modules/auth/application/authentication/signup.use-case";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import { PasswordHasherAdapter } from "@/modules/auth/infrastructure/crypto/adapters/password-hasher.adapter";
import { BcryptPasswordService } from "@/modules/auth/infrastructure/crypto/services/bcrypt-password.service";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Clean Architecture Factory: Wires Infrastructure into Use Case.
 */
export function createSignupUseCase(
  uow: AuthUnitOfWorkContract,
  logger: LoggingClientContract,
): SignupUseCase {
  const passwordService = new BcryptPasswordService();

  const hasher: PasswordHasherContract = new PasswordHasherAdapter(
    passwordService,
  );

  return new SignupUseCase(uow, hasher, logger);
}
