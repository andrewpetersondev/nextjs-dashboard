import "server-only";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/auth-user/contracts/repositories/auth-unit-of-work.contract";
import type { PasswordGeneratorContract } from "@/modules/auth/application/auth-user/contracts/services/password-generator.contract";
import type { PasswordHasherContract } from "@/modules/auth/application/auth-user/contracts/services/password-hasher.contract";
import type { AuthenticatedUserDto } from "@/modules/auth/application/auth-user/dtos/responses/authenticated-user.dto";
import { pgUniqueViolationToSignupConflictError } from "@/modules/auth/application/auth-user/mappers/pg-unique-violation-to-signup-conflict-error.mapper";
import { toAuthenticatedUserDto } from "@/modules/auth/application/auth-user/mappers/to-authenticated-user.mapper";
import {
  generateDemoUserIdentity,
  makeInvalidDemoCounterFailure,
  validateDemoUserCounter,
} from "@/modules/auth/domain/auth-user/policies/registration.policy";
import type { UserRole } from "@/shared/domain/user/user-role.schema";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export async function createDemoUserTxHelper(
  deps: Readonly<{
    uow: AuthUnitOfWorkContract;
    hasher: PasswordHasherContract;
    passwordGenerator: PasswordGeneratorContract;
  }>,
  role: UserRole,
): Promise<Result<AuthenticatedUserDto, AppError>> {
  const { uow, hasher, passwordGenerator } = deps;

  const password = passwordGenerator.generate(10);
  const hashResult = await hasher.hash(password);

  if (!hashResult.ok) {
    return hashResult;
  }

  const passwordHash = hashResult.value;

  const result = await uow.withTransaction(async (tx) => {
    const counterResult = await tx.authUsers.incrementDemoUserCounter(role);

    if (!counterResult.ok) {
      return Err(counterResult.error);
    }

    const counter = counterResult.value;

    if (!validateDemoUserCounter(counter)) {
      const failure = makeInvalidDemoCounterFailure();

      const error: AppError = makeAppError(APP_ERROR_KEYS.validation, {
        cause: "Demo user counter returned invalid value",
        message: "Demo user counter returned invalid value",
        metadata: { policy: failure.policy },
      });

      return Err(error);
    }

    const { email, username } = generateDemoUserIdentity(role, counter);

    // 4. Perform signup
    const signupResult = await tx.authUsers.signup({
      email,
      password: passwordHash,
      role,
      username,
    });

    if (!signupResult.ok) {
      const mapped = pgUniqueViolationToSignupConflictError(signupResult.error);
      return Err(mapped ?? signupResult.error);
    }

    return Ok({ entity: signupResult.value, password });
  });

  if (!result.ok) {
    return result;
  }

  const { entity, password: plainPassword } = result.value;
  const dto = toAuthenticatedUserDto(entity);
  return Ok({ ...dto, password: plainPassword });
}
