import "server-only";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import type { PasswordHasherContract } from "@/modules/auth/application/contracts/password-hasher.contract";
import { CreateDemoUserUseCase } from "@/modules/auth/application/demo/create-demo-user.use-case";
import { PasswordHasherAdapter } from "@/modules/auth/infrastructure/crypto/adapters/password-hasher.adapter";
import { BcryptPasswordService } from "@/modules/auth/infrastructure/crypto/services/bcrypt-password.service";
import { PasswordGeneratorService } from "@/modules/auth/infrastructure/crypto/services/password-generator.service";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function demoUserUseCaseFactory(
  uow: AuthUnitOfWorkContract,
  logger: LoggingClientContract,
): CreateDemoUserUseCase {
  const passwordService = new BcryptPasswordService();

  const hasher: PasswordHasherContract = new PasswordHasherAdapter(
    passwordService,
  );

  return new CreateDemoUserUseCase(
    uow,
    hasher,
    new PasswordGeneratorService(),
    logger,
  );
}
