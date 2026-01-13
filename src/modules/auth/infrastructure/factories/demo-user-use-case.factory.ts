import "server-only";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import { CreateDemoUserUseCase } from "@/modules/auth/application/use-cases/create-demo-user.use-case";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import { PasswordHasherAdapter } from "@/modules/auth/infrastructure/adapters/password-hasher.adapter";
import { PolicyPasswordGeneratorAdapter } from "@/modules/auth/infrastructure/adapters/policy-password-generator.adapter";
import { BcryptPasswordService } from "@/modules/auth/infrastructure/services/bcrypt-password.service";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

export function createDemoUserUseCase(
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
    new PolicyPasswordGeneratorAdapter(),
    logger,
  );
}
