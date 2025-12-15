import "server-only";

import type { UnitOfWorkPort } from "@/modules/auth/server/application/ports/unit-of-work.port";
import type { AuthUserTransport } from "@/modules/auth/shared/contracts/auth-user.transport";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import { parseUserRole } from "@/modules/users/domain/role/user.role.parser";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { createRandomPassword } from "@/shared/crypto/password-generator";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { makeAppErrorFromUnknown } from "@/shared/errors/factories/app-error.factory";
import { isPositiveNumber } from "@/shared/guards/number.guards";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

export class CreateDemoUserUseCase {
  private readonly uow: UnitOfWorkPort;
  private readonly hasher: HashingService;
  private readonly logger: LoggingClientContract;

  constructor(
    uow: UnitOfWorkPort,
    hasher: HashingService,
    logger: LoggingClientContract,
  ) {
    this.logger = logger.child({
      scope: "use-case",
      useCase: "createDemoUser",
    });
    this.hasher = hasher;
    this.uow = uow;
  }

  async execute(role: UserRole): Promise<Result<AuthUserTransport, AppError>> {
    const logger = this.logger.child({ role });

    try {
      const demoPassword = createRandomPassword();
      const passwordHash = await this.hasher.hash(demoPassword);

      const txResult = await this.uow.withTransaction(async (tx) => {
        const counter = await tx.authUsers.incrementDemoUserCounter(role);

        if (!isPositiveNumber(counter)) {
          return Err(
            makeAppErrorFromUnknown(new Error("invalid_counter"), "validation"),
          );
        }

        const uniqueEmail = `demo+${role}${counter}@demo.com`;
        const uniqueUsername = `Demo_${role.toUpperCase()}_${counter}`;

        const created = await tx.authUsers.signup({
          email: uniqueEmail,
          password: passwordHash,
          role,
          username: uniqueUsername,
        });

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
          operationName: "demoUser.failed",
        });

        return Err(txResult.error);
      }

      logger.operation("info", "Create demo user succeeded", {
        operationName: "demoUser.success",
      });

      return Ok(txResult.value);
    } catch (err: unknown) {
      const error = makeAppErrorFromUnknown(err, "unexpected");

      logger.operation("error", "Create demo user unexpected error", {
        error,
        operationName: "demoUser.unexpected",
      });

      return Err(error);
    }
  }
}
