import "server-only";
import { SignupUseCase } from "@/modules/auth/application/authentication/signup.use-case";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import { passwordHasherFactory } from "@/modules/auth/infrastructure/crypto/factories/password-hasher.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Clean Architecture Factory: Wires Infrastructure into Use Case.
 */
export function signupUseCaseFactory(
  uow: AuthUnitOfWorkContract,
  logger: LoggingClientContract,
): SignupUseCase {
  return new SignupUseCase(uow, passwordHasherFactory(), logger);
}
