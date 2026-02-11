import "server-only";
import { CreateDemoUserUseCase } from "@/modules/auth/application/auth-user/commands/create-demo-user.use-case";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/auth-user/contracts/repositories/auth-unit-of-work.contract";
import { passwordGeneratorFactory } from "@/modules/auth/infrastructure/composition/factories/crypto/password-generator.factory";
import { passwordHasherFactory } from "@/modules/auth/infrastructure/composition/factories/crypto/password-hasher.factory";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

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
