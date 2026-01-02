import "server-only";

import type { PasswordHasherContract } from "@/modules/auth/application/contracts/password-hasher.contract";
import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import type { UnitOfWorkContract } from "@/modules/auth/domain/repositories/unit-of-work.contract";
import { toSignupUniquenessConflict } from "@/modules/auth/infrastructure/persistence/mappers/auth-error.mapper";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { createRandomPassword } from "@/shared/crypto/password-generator";
import { parseUserRole } from "@/shared/domain/user/user-role.parser";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import {
  makeAppError,
  makeUnexpectedError,
} from "@/shared/errors/factories/app-error.factory";
import { isPositiveNumber } from "@/shared/guards/number.guards";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export class CreateDemoUserCommand {
  private readonly hasher: PasswordHasherContract;
  private readonly logger: LoggingClientContract;
  private readonly uow: UnitOfWorkContract;

  constructor(
    uow: UnitOfWorkContract,
    hasher: PasswordHasherContract,
    logger: LoggingClientContract,
  ) {
    this.logger = logger.child({
      scope: "use-case",
      useCase: "createDemoUser",
    });
    this.hasher = hasher;
    this.uow = uow;
  }

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
  async execute(role: UserRole): Promise<Result<AuthUserOutputDto, AppError>> {
    const logger = this.logger.child({ role });

    try {
      const demoPassword = createRandomPassword();
      const passwordHash = await this.hasher.hash(demoPassword);

      const txResult = await this.uow.withTransaction(async (tx) => {
        const counter = await tx.authUsers.incrementDemoUserCounter(role);

        if (!isPositiveNumber(counter)) {
          return Err(
            makeAppError(APP_ERROR_KEYS.validation, {
              cause: "invalid_demo_user_counter",
              message: "Demo user counter returned invalid value",
              metadata: {},
            }),
          );
        }

        const uniqueEmail = `demo+${role}${counter}@demo.com`;
        const uniqueUsername = `Demo_${role.toUpperCase()}_${counter}`;

        const createdResult = await tx.authUsers.signup({
          email: uniqueEmail,
          password: passwordHash,
          role,
          username: uniqueUsername,
        });

        if (!createdResult.ok) {
          const mapped = toSignupUniquenessConflict(createdResult.error);
          return Err(mapped ?? createdResult.error);
        }

        const created = createdResult.value;

        return Ok<AuthUserOutputDto>({
          email: created.email,
          id: toUserId(created.id),
          role: parseUserRole(created.role),
          username: created.username,
        });
      });

      if (!txResult.ok) {
        logger.operation("warn", "Create demo user failed", {
          error: txResult.error,
          operationContext: "create-demo-user.use-case",
          operationIdentifiers: { role },
          operationName: "demoUser.failed",
        });

        return Err(txResult.error);
      }

      logger.operation("info", "Create demo user succeeded", {
        operationContext: "create-demo-user.use-case",
        operationIdentifiers: { role },
        operationName: "demoUser.success",
      });

      return Ok(txResult.value);
    } catch (err: unknown) {
      const error = makeUnexpectedError(err, {
        message: "demoUser.unexpected",
        metadata: { role },
      });

      logger.operation("error", "Create demo user unexpected error", {
        error,
        operationContext: "create-demo-user.use-case",
        operationIdentifiers: { role },
        operationName: "demoUser.unexpected",
      });

      return Err(error);
    }
  }
}
