import "server-only";
import type { UserDto } from "@/modules/users/domain/dto/user.dto";
import type { CreateUserProps } from "@/modules/users/domain/user.entity";
import { USER_ERROR_MESSAGES } from "@/modules/users/domain/user.messages";
import type {
  CreateUserData,
  EditUserData,
} from "@/modules/users/domain/user.schema";
import type { UserRepositoryPort } from "@/modules/users/server/application/ports/user-repository.port";
import { userEntityToDto } from "@/modules/users/server/infrastructure/mappers/user.mapper";
import type { UserPersistencePatch } from "@/modules/users/server/infrastructure/repository/user.repository.types";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import type { UserId } from "@/shared/branding/brands";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

export class UserService {
  private readonly hasher: HashingService;
  private readonly logger: LoggingClientPort;
  private readonly repo: UserRepositoryPort;

  constructor(
    repo: UserRepositoryPort,
    hasher: HashingService,
    logger: LoggingClientPort,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    this.logger = logger.child({ scope: "user-service" });
  }

  async createUser(input: CreateUserData): Promise<Result<UserDto, AppError>> {
    try {
      const hashedPassword = await this.hasher.hash(input.password);

      const creationParams: CreateUserProps = {
        email: input.email,
        password: hashedPassword,
        role: input.role,
        username: input.username,
      };

      const user = await this.repo.create(creationParams);

      if (!user) {
        return Err(
          normalizeUnknownToAppError(
            new Error(USER_ERROR_MESSAGES.createFailed),
            "database",
          ),
        );
      }

      this.logger.info("User created successfully", {
        logging: { email: input.email, username: input.username },
      });

      return Ok(userEntityToDto(user));
    } catch (err) {
      const error = normalizeUnknownToAppError(err, "unexpected");
      this.logger.error("User creation failed", {
        error,
        logging: { email: input.email },
      });
      return Err(error);
    }
  }

  async updateUser(
    id: UserId,
    patch: EditUserData,
  ): Promise<Result<UserDto, AppError>> {
    try {
      let finalPatch: UserPersistencePatch;

      if (patch.password) {
        const hashedPassword = await this.hasher.hash(patch.password);
        finalPatch = {
          ...patch,
          password: hashedPassword,
        };
      } else {
        finalPatch = { ...patch } as UserPersistencePatch;
      }

      const updated = await this.repo.update(id, finalPatch);

      if (!updated) {
        return Err(
          normalizeUnknownToAppError(
            new Error(USER_ERROR_MESSAGES.updateFailed),
            "database",
          ),
        );
      }

      this.logger.info("User updated successfully", {
        logging: { userId: id },
      });

      return Ok(userEntityToDto(updated));
    } catch (err) {
      const error = normalizeUnknownToAppError(err, "unexpected");
      this.logger.error("User update failed", {
        error,
        logging: { userId: id },
      });
      return Err(error);
    }
  }

  async deleteUser(id: UserId): Promise<Result<UserDto, AppError>> {
    try {
      const deleted = await this.repo.delete(id);

      if (!deleted) {
        return Err(
          normalizeUnknownToAppError(
            new Error(USER_ERROR_MESSAGES.notFoundOrDeleteFailed),
            "not_found",
          ),
        );
      }

      this.logger.info("User deleted successfully", {
        logging: { userId: id },
      });

      return Ok(userEntityToDto(deleted));
    } catch (err) {
      const error = normalizeUnknownToAppError(err, "unexpected");
      this.logger.error("User deletion failed", {
        error,
        logging: { userId: id },
      });
      return Err(error);
    }
  }

  async findUserById(id: UserId): Promise<UserDto | null> {
    try {
      const user = await this.repo.findById(id);
      return user ? userEntityToDto(user) : null;
    } catch (err) {
      this.logger.error(USER_ERROR_MESSAGES.readFailed, {
        error: err,
        logging: { userId: id },
      });
      return null;
    }
  }

  async findUsers(query: string, page: number): Promise<UserDto[]> {
    try {
      const users = await this.repo.findMany(query, page);
      return users.map(userEntityToDto);
    } catch (err) {
      this.logger.error("Failed to fetch filtered users", {
        error: err,
        logging: { page, query },
      });
      return [];
    }
  }

  async getUserPageCount(query: string): Promise<number> {
    try {
      return await this.repo.getPageCount(query);
    } catch (err) {
      this.logger.error("Failed to count users", {
        error: err,
        logging: { query },
      });
      return 0;
    }
  }
}
