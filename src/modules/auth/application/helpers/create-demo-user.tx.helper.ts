import "server-only";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import type { PasswordGeneratorContract } from "@/modules/auth/application/contracts/password-generator.contract";
import type { PasswordHasherContract } from "@/modules/auth/application/contracts/password-hasher.contract";
import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import { toAuthUserOutputDto } from "@/modules/auth/application/mappers/to-auth-user-output-dto.mapper";
import { pgUniqueViolationToSignupConflictError } from "@/modules/auth/domain/mappers/pg-unique-violation-to-signup-conflict-error.mapper";
import {
  generateDemoUserIdentity,
  makeInvalidDemoCounterError,
  validateDemoUserCounter,
} from "@/modules/auth/domain/policies/registration.policy";
import type { UserRole } from "@/shared/domain/user/user-role.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
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
    // 1. Get and increment demo counter
    const counter = await tx.authUsers.incrementDemoUserCounter(role);

    // 2. Validate counter using domain policy
    if (!validateDemoUserCounter(counter)) {
      return Err(makeInvalidDemoCounterError(counter));
    }

    // 3. Generate identity using domain policy
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
  const dto = toAuthUserOutputDto(entity);
  return Ok({ ...dto, password: plainPassword });
}
