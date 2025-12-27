import "server-only";

import type { UnitOfWorkPort } from "@/modules/auth/server/application/ports/unit-of-work.port";
import { toSignupUniquenessConflict } from "@/modules/auth/server/application/services/auth-error-mapper.service";
import type { AuthUserTransport } from "@/modules/auth/shared/contracts/auth-user.transport";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import { parseUserRole } from "@/modules/users/domain/role/user.role.parser";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { createRandomPassword } from "@/shared/crypto/password-generator";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import {
  makeAppError,
  makeUnexpectedError,
} from "@/shared/errors/factories/app-error.factory";
import { isPositiveNumber } from "@/shared/guards/number.guards";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export class CreateDemoUserUseCase {
  private readonly hasher: HashingService;
  private readonly logger: LoggingClientPort;
  private readonly uow: UnitOfWorkPort;

  constructor(
    uow: UnitOfWorkPort,
    hasher: HashingService,
    logger: LoggingClientPort,
  ) {
    this.logger = logger.child({
      scope: "use-case",
      useCase: "createDemoUser",
    });
    this.hasher = hasher;
    this.uow = uow;
  }

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
  async execute(role: UserRole): Promise<Result<AuthUserTransport, AppError>> {
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

        return Ok<AuthUserTransport>({
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
