import "server-only";
import type { UserRepositoryContract } from "@/modules/users/application/contracts/user-repository.contract";
import type { UserDto } from "@/modules/users/application/dtos/user.dto";
import { USER_ERROR_MESSAGES } from "@/modules/users/domain/constants/user.constants";
import type {
  CreateUserProps,
  UpdateUserProps,
} from "@/modules/users/domain/entities/user.entity";
import type {
  CreateUserData,
  EditUserData,
} from "@/modules/users/domain/schemas/user.schema";
import { toUserDto } from "@/modules/users/infrastructure/mappers/to-user-dto.mapper";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import type { UserId } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { normalizeUnknownError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

export class UserService {
  private readonly hasher: HashingService;
  private readonly logger: LoggingClientContract;
  private readonly repo: UserRepositoryContract;

  constructor(
    repo: UserRepositoryContract,
    hasher: HashingService,
    logger: LoggingClientContract,
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

      const result = await this.repo.create(creationParams);

      if (!result.ok) {
        return result;
      }

      const user = result.value;

      if (!user) {
        return Err(
          normalizeUnknownError(
            new Error(USER_ERROR_MESSAGES.createFailed),
            APP_ERROR_KEYS.database,
          ),
        );
      }

      this.logger.info("User created successfully", {
        logging: { email: input.email, username: input.username },
      });

      return Ok(toUserDto(user));
    } catch (err) {
      const error = normalizeUnknownError(err, APP_ERROR_KEYS.unexpected);
      this.logger.error("User creation failed", {
        error,
        logging: { email: input.email },
      });
      return Err(error);
    }
  }

  async deleteUser(id: UserId): Promise<Result<UserDto, AppError>> {
    try {
      const result = await this.repo.delete(id);

      if (!result.ok) {
        return result;
      }

      const deleted = result.value;

      if (!deleted) {
        return Err(
          normalizeUnknownError(
            new Error(USER_ERROR_MESSAGES.notFoundOrDeleteFailed),
            APP_ERROR_KEYS.not_found,
          ),
        );
      }

      this.logger.info("User deleted successfully", {
        logging: { userId: id },
      });

      return Ok(toUserDto(deleted));
    } catch (err) {
      const error = normalizeUnknownError(err, APP_ERROR_KEYS.unexpected);
      this.logger.error("User deletion failed", {
        error,
        logging: { userId: id },
      });
      return Err(error);
    }
  }

  async readFilteredUsers(
    query: string,
    page: number,
  ): Promise<Result<UserDto[], AppError>> {
    try {
      const result = await this.repo.readFilteredUsers(query, page);

      if (!result.ok) {
        return result;
      }

      return Ok(result.value.map(toUserDto));
    } catch (err) {
      const error = normalizeUnknownError(err, APP_ERROR_KEYS.unexpected);
      this.logger.error("Failed to fetch filtered users", {
        error,
        logging: { page, query },
      });
      return Err(error);
    }
  }

  async readUserById(id: UserId): Promise<Result<UserDto | null, AppError>> {
    try {
      const result = await this.repo.readById(id);

      if (!result.ok) {
        return result;
      }

      const user = result.value;
      return Ok(user ? toUserDto(user) : null);
    } catch (err) {
      const error = normalizeUnknownError(err, APP_ERROR_KEYS.unexpected);
      this.logger.error(USER_ERROR_MESSAGES.readFailed, {
        error,
        logging: { userId: id },
      });
      return Err(error);
    }
  }

  async readUserPageCount(query: string): Promise<Result<number, AppError>> {
    try {
      return await this.repo.readPageCount(query);
    } catch (err) {
      const error = normalizeUnknownError(err, APP_ERROR_KEYS.unexpected);
      this.logger.error("Failed to count users", {
        error,
        logging: { query },
      });
      return Err(error);
    }
  }

  async updateUser(
    id: UserId,
    patch: EditUserData,
  ): Promise<Result<UserDto, AppError>> {
    try {
      let finalPatch: UpdateUserProps;

      if (patch.password) {
        const hashedPassword = await this.hasher.hash(patch.password);
        finalPatch = {
          ...patch,
          password: hashedPassword,
        };
      } else {
        finalPatch = { ...patch } as UpdateUserProps;
      }

      const result = await this.repo.update(id, finalPatch);

      if (!result.ok) {
        return result;
      }

      const updated = result.value;

      if (!updated) {
        return Err(
          normalizeUnknownError(
            new Error(USER_ERROR_MESSAGES.updateFailed),
            APP_ERROR_KEYS.database,
          ),
        );
      }

      this.logger.info("User updated successfully", {
        logging: { userId: id },
      });

      return Ok(toUserDto(updated));
    } catch (err) {
      const error = normalizeUnknownError(err, APP_ERROR_KEYS.unexpected);
      this.logger.error("User update failed", {
        error,
        logging: { userId: id },
      });
      return Err(error);
    }
  }
}
