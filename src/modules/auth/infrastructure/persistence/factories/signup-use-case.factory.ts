import "server-only";
import { SignupUseCase } from "@/modules/auth/application/authentication/signup.use-case";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import { passwordHasherFactory } from "@/modules/auth/infrastructure/crypto/factories/password-hasher.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for creating the SignupUseCase.
 *
 * @param uow - The Unit of Work for database transactions.
 * @param logger - The logging client.
 * @returns An instance of {@link SignupUseCase}.
 */
export function signupUseCaseFactory(
  uow: AuthUnitOfWorkContract,
  logger: LoggingClientContract,
): SignupUseCase {
  return new SignupUseCase(uow, passwordHasherFactory(), logger);
}
