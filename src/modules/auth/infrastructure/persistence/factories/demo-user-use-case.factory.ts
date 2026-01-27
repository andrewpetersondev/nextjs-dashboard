import "server-only";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import { CreateDemoUserUseCase } from "@/modules/auth/application/demo/create-demo-user.use-case";
import { passwordGeneratorFactory } from "@/modules/auth/infrastructure/crypto/factories/password-generator.factory";
import { passwordHasherFactory } from "@/modules/auth/infrastructure/crypto/factories/password-hasher.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for creating the CreateDemoUserUseCase.
 *
 * @param uow - The Unit of Work for database transactions.
 * @param logger - The logging client.
 * @returns An instance of {@link CreateDemoUserUseCase}.
 */
export function demoUserUseCaseFactory(
  uow: AuthUnitOfWorkContract,
  logger: LoggingClientContract,
): CreateDemoUserUseCase {
  return new CreateDemoUserUseCase(
    uow,
    passwordHasherFactory(),
    passwordGeneratorFactory(),
    logger,
  );
}
